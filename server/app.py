from flask import Flask, jsonify, request
from flask_cors import CORS
import os, sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "../database/hrm.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

app = Flask(__name__)
CORS(app)

@app.route("/api/health")
def health():
    return {"ok": True}

# === Engineers: list & detail (간단 버전) ===
@app.route("/api/engineers", methods=["GET"])
def list_engineers():
    q = request.args.get("q","").strip()
    limit = int(request.args.get("limit","500") or "500")
    order = request.args.get("order","name")
    dirn  = request.args.get("dir","asc").lower()
    status = request.args.get("status","전체")
    admin  = request.args.get("admin","0") == "1"

    allowed_order = {"name","department","join_date","leave_date","leaving_expected_date"}
    if order not in allowed_order:
        order = "name"
    dirn = "DESC" if dirn == "desc" else "ASC"

    sql = """
    SELECT eng_id, name, department, grade, license, biz_license,
           phone, join_date, leaving_expected_date, leave_date, status, photo_path, address
    FROM engineers
    WHERE 1=1
    """
    params = []
    if q:
        sql += " AND (eng_id LIKE ? OR name LIKE ? OR department LIKE ?)"
        params += [f"%{q}%", f"%{q}%", f"%{q}%"]
    if status and status != "전체":
        if admin:
            sql += " AND status = ?"
            params += [status]
        else:
            if status == "삭제" or status == "삭제대기":
                sql += " AND 1=0"
            else:
                sql += " AND status = ?"
                params += [status]
    else:
        if not admin:
            sql += " AND (status IS NULL OR status NOT IN ('삭제','삭제대기'))"

    sql += f" ORDER BY {order} {dirn} LIMIT ?"
    params.append(limit)

    conn = get_conn()
    try:
        rows = conn.execute(sql, params).fetchall()
        return jsonify({"engineers":[dict(r) for r in rows]})
    finally:
        conn.close()

@app.route("/api/engineers/<eng_id>", methods=["GET"])
def get_engineer(eng_id):
    conn = get_conn()
    try:
        eng = conn.execute("SELECT * FROM engineers WHERE eng_id=?", (eng_id,)).fetchone()
        if not eng:
            return jsonify({"error":"Engineer not found"}), 404
        def allq(t):
            try:
                return [dict(x) for x in conn.execute(f"SELECT * FROM {t} WHERE engineer_id=?", (eng_id,)).fetchall()]
            except sqlite3.OperationalError:
                return []
        return jsonify({
            "engineer": dict(eng),
            "education": allq("education"),
            "qualifications": allq("qualifications"),
            "careers": allq("careers"),
            "trainings": allq("trainings"),
            "attachments": allq("attachments")
        })
    finally:
        conn.close()

# === Import blueprint 등록 ===
from import_routes import import_routes
app.register_blueprint(import_routes, url_prefix="/api")

# 디버그: 라우트 목록
@app.route("/api/routes")
def routes():
    out = []
    for r in app.url_map.iter_rules():
        out.append({"rule": str(r), "methods": list(r.methods)})
    return jsonify(out)

if __name__ == "__main__":
    port = int(os.environ.get("PORT","5050"))
    app.run(host="127.0.0.1", port=port, debug=True)

from admin_routes import admin_bp
app.register_blueprint(admin_bp)
# === Engineer CRUD routes (create/update) ===
# - 신규 등록: POST /api/engineers
# - 수정 저장:  PUT  /api/engineers/<eng_id>

from flask import request, jsonify  # 중복 import 되어도 무방

def _derive_birth_and_mask(resident_id: str):
    """
    resident_id 예: '900101-1234567'
    반환: (birth_date '90.01.01.', rrn_masked '900101-1******')
    """
    if not resident_id:
        return (None, None)
    import re
    m = re.match(r"^(\d{6})-(\d)\d{6}$", resident_id.strip())
    if not m:
        return (None, None)
    yymmdd, first = m.group(1), m.group(2)
    birth_date = f"{yymmdd[:2]}.{yymmdd[2:4]}.{yymmdd[4:6]}."
    rrn_masked = f"{yymmdd}-{first}******"
    return (birth_date, rrn_masked)

@app.route("/api/engineers", methods=["POST"])
def create_engineer():
    data = request.get_json(force=True) or {}
    # 필수값 체크
    eng_id = (data.get("eng_id") or "").strip()
    name   = (data.get("name") or "").strip()
    if not eng_id or not name:
        return jsonify({"ok": False, "error": "eng_id, name required"}), 400

    # 선택 필드
    resident_id = (data.get("resident_id") or "").strip()
    join_date   = (data.get("join_date") or None)
    address     = (data.get("address") or None)
    phone       = (data.get("phone") or None)
    department  = (data.get("department") or None)
    leaving_expected_date = (data.get("leaving_expected_date") or None)
    leave_date  = (data.get("leave_date") or None)
    notes       = (data.get("notes") or None)
    status      = (data.get("status") or "재직")

    birth_date, rrn_masked = _derive_birth_and_mask(resident_id)

    conn = get_conn()
    conn.execute("""
        INSERT INTO engineers
        (eng_id, name, birth_date, rrn_masked, resident_id, phone, address,
         department, grade, license, biz_license, overlapping_work,
         join_date, leaving_expected_date, leave_date, status, notes, photo_path)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?, ?, ?, ?, NULL)
        ON CONFLICT(eng_id) DO UPDATE SET
          name=excluded.name,
          birth_date=excluded.birth_date,
          rrn_masked=excluded.rrn_masked,
          resident_id=excluded.resident_id,
          phone=excluded.phone,
          address=excluded.address,
          department=excluded.department,
          join_date=excluded.join_date,
          leaving_expected_date=excluded.leaving_expected_date,
          leave_date=excluded.leave_date,
          status=excluded.status,
          notes=excluded.notes
    """, (
        eng_id, name, birth_date, rrn_masked, resident_id, phone, address,
        department, join_date, leaving_expected_date, leave_date, status, notes
    ))
    conn.commit()
    return jsonify({"ok": True, "eng_id": eng_id})

@app.route("/api/engineers/<eng_id>", methods=["PUT"])
def update_engineer(eng_id):
    data = request.get_json(force=True) or {}
    name         = (data.get("name") or None)
    resident_id  = (data.get("resident_id") or None)
    join_date    = (data.get("join_date") or None)
    address      = (data.get("address") or None)
    phone        = (data.get("phone") or None)
    department   = (data.get("department") or None)
    leaving_expected_date = (data.get("leaving_expected_date") or None)
    leave_date   = (data.get("leave_date") or None)
    notes        = (data.get("notes") or None)
    status       = (data.get("status") or None)

    birth_date, rrn_masked = _derive_birth_and_mask(resident_id or "")

    conn = get_conn()
    conn.execute("""
      UPDATE engineers SET
        name=?,
        birth_date=?,
        rrn_masked=?,
        resident_id=?,
        phone=?,
        address=?,
        department=?,
        join_date=?,
        leaving_expected_date=?,
        leave_date=?,
        status=?,
        notes=?
      WHERE eng_id=?
    """, (
        name, birth_date, rrn_masked, resident_id,
        phone, address, department, join_date,
        leaving_expected_date, leave_date, status, notes, eng_id
    ))
    conn.commit()
    return jsonify({"ok": True, "eng_id": eng_id})
# === end Engineer CRUD routes ===
