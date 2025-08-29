from flask import Blueprint, request, jsonify
import sqlite3, os, io
import pandas as pd
from datetime import datetime

import_routes = Blueprint("import_routes", __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "../database/hrm.db")

COLS = ["사번","성명","주민등록번호","입사일","주소","전화번호","부서명","퇴사예정일","퇴사일","비고"]

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_schema():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS engineers (
        eng_id TEXT PRIMARY KEY,
        name TEXT,
        birth_date TEXT,
        rrn_masked TEXT,
        phone TEXT,
        address TEXT,
        department TEXT,
        grade TEXT,
        license TEXT,
        biz_license TEXT,
        overlapping_work TEXT,
        join_date TEXT,
        leaving_expected_date TEXT,
        leave_date TEXT,
        status TEXT,
        notes TEXT,
        photo_path TEXT
    );
    """)
    conn.commit()
    conn.close()

def parse_birth_from_rrn(rrn: str):
    if not rrn or "-" not in rrn:
        return None, None
    front, back = rrn.split("-", 1)
    if len(front) != 6 or len(back) < 1:
        return None, None
    s = back[0]
    # 1,2: 1900~, 3,4: 2000~
    cent = "19" if s in ("1","2") else "20" if s in ("3","4") else None
    if not cent:
        return None, None
    yyyy = cent + front[0:2]
    mm   = front[2:4]
    dd   = front[4:6]
    birth = f"{yyyy}-{mm}-{dd}"
    masked = front + "-" + (back[0] + "*"*6)
    return birth, masked

@import_routes.route("/import/engineers/ping", methods=["GET"])
def ping():
    return jsonify({"ok": True})

@import_routes.route("/import/engineers", methods=["POST"])
def import_engineers():
    ensure_schema()
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "file field required"}), 400
    f = request.files["file"]
    if not f.filename.lower().endswith((".xlsx",".xls",".csv")):
        return jsonify({"ok": False, "error": "xlsx/csv only"}), 415

    # 읽기
    if f.filename.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(f.read()), dtype=str).fillna("")
    else:
        df = pd.read_excel(io.BytesIO(f.read()), dtype=str).fillna("")

    # 컬럼 검사(한국어 헤더)
    for col in COLS:
        if col not in df.columns:
            return jsonify({"ok": False, "error": f"템플릿 컬럼 누락: {col}"}), 400

    conn = get_conn()
    cur = conn.cursor()
    inserted = 0
    for _, row in df.iterrows():
        emp   = row["사번"].strip()
        name  = row["성명"].strip()
        rrn   = row["주민등록번호"].strip()
        join  = row["입사일"].strip()
        addr  = row["주소"].strip()
        phone = row["전화번호"].strip()
        dept  = row["부서명"].strip()
        leave_expected = row["퇴사예정일"].strip()
        leave_date     = row["퇴사일"].strip()
        notes = row["비고"].strip()

        birth, rrn_masked = parse_birth_from_rrn(rrn)
        # 표출형 생년월일(yyyy-mm-dd -> y.mm.dd.)
        birth_display = None
        if birth:
            try:
                dt = datetime.strptime(birth, "%Y-%m-%d")
                birth_display = dt.strftime("%y.%m.%d.")
            except:
                birth_display = None

        # 상태 자동 지정
        status = "재직"
        if leave_date:
            status = "퇴사"
        elif leave_expected:
            status = "퇴사예정"

        # upsert
        cur.execute("""
            INSERT INTO engineers
            (eng_id, name, birth_date, rrn_masked, phone, address, department, grade, license, biz_license,
             overlapping_work, join_date, leaving_expected_date, leave_date, status, notes, photo_path)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(eng_id) DO UPDATE SET
              name=excluded.name,
              birth_date=excluded.birth_date,
              rrn_masked=excluded.rrn_masked,
              phone=excluded.phone,
              address=excluded.address,
              department=excluded.department,
              join_date=excluded.join_date,
              leaving_expected_date=excluded.leaving_expected_date,
              leave_date=excluded.leave_date,
              status=excluded.status,
              notes=excluded.notes
        """, (
            emp, name, birth_display, rrn_masked, phone, addr, dept, None, None, None,
            None, join or None, leave_expected or None, leave_date or None, status, notes, None
        ))
        inserted += 1

    conn.commit()
    conn.close()
    return jsonify({"ok": True, "count": inserted})
