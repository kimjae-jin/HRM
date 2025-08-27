# -*- coding: utf-8 -*-
from flask import Flask, jsonify, request, send_from_directory, send_file
import sqlite3, os, io, datetime
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}, r"/files/*": {"origins": "*"}})

# ====== 경로/설정 ======
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATABASE    = os.path.join(BASE_DIR, "../database/hrm.db")
UPLOAD_ROOT = os.path.abspath(os.path.join(BASE_DIR, "../uploads"))
PROFILE_DIR = os.path.join(UPLOAD_ROOT, "profiles")
os.makedirs(PROFILE_DIR, exist_ok=True)

ALLOWED_EXTS = {"png", "jpg", "jpeg", "webp"}

def get_conn():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def table_exists(conn, name: str) -> bool:
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (name,)
    ).fetchone()
    return row is not None

def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTS

# ---------- 정책 로딩/매칭/판정 ----------
def load_policies(conn):
    if not table_exists(conn, "license_policies"):
        return []
    rows = conn.execute("SELECT * FROM license_policies").fetchall()
    return [dict(r) for r in rows]

def load_metrics(conn):
    if not table_exists(conn, "company_metrics"):
        return {}
    rows = conn.execute("SELECT * FROM company_metrics").fetchall()
    return {r["code"]: dict(r) for r in rows}

def match_policy(policies, biz_license_text):
    """engineer.biz_license(문자열) 안에 정책 keywords 중 하나라도 포함되면 해당 정책으로 매칭"""
    if not biz_license_text: return None
    src = (biz_license_text or "").strip()
    for p in policies:
        kws = (p.get("keywords") or "").split(",")
        for kw in [k.strip() for k in kws if k.strip()]:
            if kw in src:
                return p
    return None

def evaluate_compliance(policy, metrics):
    """정책 요구치와 회사 지표를 비교하여 적합성/부족항목 산출"""
    if not policy: 
        return {"status":"미정", "color":"gray", "reason":"매칭되는 정책 없음"}
    met = metrics.get(policy["code"])
    if not met:
        return {"status":"미정", "color":"gray", "reason":"회사 지표 미등록"}

    req_to   = policy.get("required_to")   or 0
    req_po   = policy.get("required_po")   or 0
    req_todp = policy.get("required_todp") or 0

    cur_to   = met.get("current_to")   or 0
    cur_po   = met.get("current_po")   or 0
    cur_todp = met.get("current_todp") or 0

    lacks = []
    if cur_to   < req_to:   lacks.append(f"T/O {cur_to}/{req_to}")
    if cur_po   < req_po:   lacks.append(f"P/O {cur_po}/{req_po}")
    if cur_todp < req_todp: lacks.append(f"T/odp {cur_todp}/{req_todp}")

    if lacks:
        return {"status":"미달", "color":"red", "reason":", ".join(lacks)}
    else:
        return {"status":"적합", "color":"green", "reason":f"T/O {cur_to}/{req_to}, P/O {cur_po}/{req_po}, T/odp {cur_todp}/{req_todp}"}

# ====== 정적 제공(업로드된 파일) ======
@app.route("/files/<path:subpath>")
def serve_files(subpath):
    return send_from_directory(UPLOAD_ROOT, subpath, as_attachment=False)

# ====== 헬스체크 ======
@app.route("/api/health")
def health():
    return {"ok": True}

# ====== 회사 지표 조회/업데이트 ======
@app.route("/api/license/metrics", methods=["GET","PUT"])
def license_metrics():
    conn = get_conn()
    try:
        if request.method == "GET":
            return jsonify(load_metrics(conn))
        else:
            payload = request.get_json(force=True)
            # payload: { "ENG-ROAD": {"current_to":6,"current_po":2,"current_todp":1}, ... }
            now = datetime.datetime.utcnow().isoformat()
            for code, vals in (payload or {}).items():
                to   = int(vals.get("current_to", 0))
                po   = int(vals.get("current_po", 0))
                todp = int(vals.get("current_todp", 0))
                conn.execute("""
                  INSERT INTO company_metrics(code,current_to,current_po,current_todp,updated_at)
                  VALUES (?,?,?,?,?)
                  ON CONFLICT(code) DO UPDATE SET current_to=excluded.current_to, current_po=excluded.current_po,
                                                 current_todp=excluded.current_todp, updated_at=excluded.updated_at
                """, (code, to, po, todp, now))
            conn.commit()
            return jsonify({"ok": True})
    finally:
        conn.close()

# ====== 정책 목록 ======
@app.route("/api/license/policies", methods=["GET"])
def list_policies():
    conn = get_conn()
    try:
        return jsonify(load_policies(conn))
    finally:
        conn.close()

# ====== 기술인 리스트 ======
@app.route("/api/engineers", methods=["GET"])
def list_engineers():
    q         = (request.args.get("q") or "").strip()
    limit     = min(int(request.args.get("limit", "100") or 100), 1000)
    order     = (request.args.get("order") or "name").strip()
    direction = (request.args.get("dir") or "asc").lower()
    direction = "DESC" if direction == "desc" else "ASC"
    status    = (request.args.get("status") or "전체").strip()

    allowed_cols = {"eng_id","name","department","grade","license","join_date","status","biz_license"}
    if order not in allowed_cols:
        order = "name"

    conn = get_conn()
    try:
        if not table_exists(conn, "engineers"):
            return jsonify([])

        base = """
          SELECT eng_id, name, department, grade,
                 license,              -- 자격사항
                 biz_license,          -- 업/면허
                 phone, join_date, photo_path,
                 COALESCE(status, '재직') AS status
          FROM engineers
        """
        wheres = []
        params = []
        if q:
            like = f"%{q}%"
            wheres.append("(name LIKE ? OR department LIKE ? OR phone LIKE ? OR grade LIKE ? OR license LIKE ?)")
            params.extend([like, like, like, like, like])
        if status and status != "전체":
            wheres.append("(COALESCE(status,'재직') = ?)")
            params.append(status)
        if wheres:
            base += " WHERE " + " AND ".join(wheres)

        sql = f"{base} ORDER BY {order} {direction} LIMIT ?"
        params.append(limit)

        rows = conn.execute(sql, params).fetchall()
        # 적합성 계산 추가
        policies = load_policies(conn)
        metrics  = load_metrics(conn)

        out = []
        for r in rows:
            d = dict(r)
            pol = match_policy(policies, d.get("biz_license"))
            eva = evaluate_compliance(pol, metrics)
            d["biz_compliance"] = eva  # {status, color, reason}
            out.append(d)
        return jsonify(out)
    finally:
        conn.close()

# ====== 엔지니어 상세 ======
@app.route("/api/engineers/<eng_id>", methods=["GET"])
def get_engineer(eng_id):
    conn = get_conn()
    try:
        if not table_exists(conn, "engineers"):
            return jsonify({"error":"DB not initialized"}), 500

        eng = conn.execute("SELECT * FROM engineers WHERE eng_id = ?", (eng_id,)).fetchone()
        if not eng:
            return jsonify({"error": "Engineer not found"}), 404

        def sel_all(table):
            if not table_exists(conn, table): return []
            return [dict(x) for x in conn.execute(f"SELECT * FROM {table} WHERE engineer_id = ?", (eng_id,)).fetchall()]

        data = {
            "engineer": dict(eng),
            "education": sel_all("education"),
            "qualifications": sel_all("qualifications"),
            "careers": sel_all("careers"),
            "trainings": sel_all("trainings"),
            "attachments": sel_all("attachments"),
        }

        # 상세에도 적합성 포함
        policies = load_policies(conn)
        metrics  = load_metrics(conn)
        pol = match_policy(policies, data["engineer"].get("biz_license"))
        data["biz_compliance"] = evaluate_compliance(pol, metrics)
        data["policy"] = pol

        return jsonify(data)
    finally:
        conn.close()

# ====== 프로필 사진 업로드 ======
@app.route("/api/engineers/<eng_id>/photo", methods=["POST"])
def upload_photo(eng_id):
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "no file"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"ok": False, "error": "empty filename"}), 400
    ext = file.filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTS:
        return jsonify({"ok": False, "error": "unsupported type"}), 415

    filename = secure_filename(f"{eng_id}.{ext}")
    save_path = os.path.join(PROFILE_DIR, filename)
    file.save(save_path)

    rel_path = f"profiles/{filename}"
    url_path = f"/files/{rel_path}"

    conn = get_conn()
    try:
        cur = conn.execute("SELECT eng_id FROM engineers WHERE eng_id=?", (eng_id,)).fetchone()
        if not cur:
            return jsonify({"ok": False, "error": "engineer not found"}), 404
        conn.execute("UPDATE engineers SET photo_path=?, status=COALESCE(status,'재직') WHERE eng_id=?", (url_path, eng_id))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True, "photo_path": url_path})

# ====== 엑셀 내보내기 ======
def _send_xlsx(writer_fn, filename: str):
    bio = io.BytesIO()
    with pd.ExcelWriter(bio, engine="openpyxl") as writer:
        writer_fn(writer)
    bio.seek(0)
    return send_file(
        bio,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename,
    )

@app.route("/api/export/template.xlsx", methods=["GET"])
def export_template():
    def build(writer):
        pd.DataFrame(columns=[
            "사번(eng_id)","성명","생년월일","연락처","부서","등급",
            "자격사항","업/면허표기","업무중첩",
            "입사일","퇴사예정일","퇴사일","특이사항",
            "상태(재직/휴직/퇴사예정/퇴사/삭제/삭제대기)"
        ]).to_excel(writer, index=False, sheet_name="기술인")

        pd.DataFrame(columns=[
            "id","사번(eng_id)","졸업일","학교명","전공","학위","비고","첨부파일명","첨부경로"
        ]).to_excel(writer, index=False, sheet_name="학력")

        pd.DataFrame(columns=[
            "id","사번(eng_id)","자격명","취득일","자격번호","발급기관","비고","첨부파일명","첨부경로"
        ]).to_excel(writer, index=False, sheet_name="자격")

        pd.DataFrame(columns=[
            "id","사번(eng_id)","공사명","발주처","소속회사","직무/역할",
            "시작일","종료일","계약금액(원)","참여율(%)","검증상태","비고"
        ]).to_excel(writer, index=False, sheet_name="경력")

        pd.DataFrame(columns=[
            "id","사번(eng_id)","교육명","기관명","시작일","종료일","시간(시간)",
            "증서번호","첨부파일명","첨부경로","비고"
        ]).to_excel(writer, index=False, sheet_name="교육훈련")
    return _send_xlsx(build, "hrm_템플릿.xlsx")

@app.route("/api/export/all.xlsx", methods=["GET"])
def export_all():
    conn = get_conn()
    try:
        if not table_exists(conn, "engineers"):
            return jsonify({"error":"DB not initialized"}), 500

        def build(writer):
            for table in ["engineers","education","qualifications","careers","trainings","attachments","license_policies","company_metrics"]:
                if table_exists(conn, table):
                    rows = conn.execute(f"SELECT * FROM {table}").fetchall()
                    pd.DataFrame([dict(r) for r in rows]).to_excel(writer, index=False, sheet_name=table)
        return _send_xlsx(build, f"hrm_all_{datetime.date.today().isoformat()}.xlsx")
    finally:
        conn.close()

@app.route("/api/export/one/<eng_id>.xlsx", methods=["GET"])
def export_one(eng_id):
    conn = get_conn()
    try:
        if not table_exists(conn, "engineers"):
            return jsonify({"error":"DB not initialized"}), 500

        eng = conn.execute("SELECT * FROM engineers WHERE eng_id=?", (eng_id,)).fetchone()
        if not eng:
            return jsonify({"error":"Engineer not found"}), 404

        def sel(table):
            if not table_exists(conn, table): return []
            return [dict(x) for x in conn.execute(f"SELECT * FROM {table} WHERE engineer_id=?", (eng_id,)).fetchall()]

        def build(writer):
            pd.DataFrame([dict(eng)]).to_excel(writer, index=False, sheet_name="engineer")
            pd.DataFrame(sel("education")).to_excel(writer, index=False, sheet_name="education")
            pd.DataFrame(sel("qualifications")).to_excel(writer, index=False, sheet_name="qualifications")
            pd.DataFrame(sel("careers")).to_excel(writer, index=False, sheet_name="careers")
            pd.DataFrame(sel("trainings")).to_excel(writer, index=False, sheet_name="trainings")
            pd.DataFrame(sel("attachments")).to_excel(writer, index=False, sheet_name="attachments")
        return _send_xlsx(build, f"{eng_id}_{datetime.date.today().isoformat()}.xlsx")
    finally:
        conn.close()

# ====== 실행 ======
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
