# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
import sqlite3, os, io
import pandas as pd

bp = Blueprint("import_excel", __name__)
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../database/hrm.db"))

REQUIRED_HEADERS = [
    "eng_id","name","birth_date","phone","department","grade","license",
    "overlapping_work","join_date","leaving_expected_date","leave_date","notes"
]

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    return conn

def normalize_date(v):
    if pd.isna(v) or str(v).strip()=="":
        return None
    try:
        return pd.to_datetime(v).strftime("%Y-%m-%d")
    except Exception:
        s = str(v).strip().replace(".", "-").replace("/", "-")
        try:
            return pd.to_datetime(s).strftime("%Y-%m-%d")
        except Exception:
            return s

def normalize_text(v):
    if pd.isna(v):
        return None
    return str(v).strip()

def normalize_overlapping(v):
    s = normalize_text(v) or "N"
    return "Y" if s.upper() == "Y" else "N"

@bp.route("/api/import/engineers", methods=["POST"])
def import_engineers():
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "파일이 없습니다."}), 400

    f = request.files["file"]
    name = f.filename.lower()

    try:
        if name.endswith(".csv"):
            df = pd.read_csv(f, dtype=str).fillna("")
        elif name.endswith((".xlsx", ".xls")):
            data = f.read()
            bio = io.BytesIO(data)
            df = pd.read_excel(bio, dtype=str).fillna("")
        else:
            return jsonify({"ok": False, "error": "xlsx, xls, csv만 지원합니다."}), 415
    except Exception as e:
        return jsonify({"ok": False, "error": f"파일 파싱 실패: {e}"}), 400

    cols = [c.strip() for c in df.columns.tolist()]
    missing = [h for h in REQUIRED_HEADERS if h not in cols]
    if missing:
        return jsonify({"ok": False, "error": f"헤더 누락: {', '.join(missing)}"}), 400

    df = df[REQUIRED_HEADERS].copy()

    df["eng_id"] = df["eng_id"].apply(normalize_text)
    if df["eng_id"].isnull().any() or any(x=="" for x in df["eng_id"].tolist()):
        return jsonify({"ok": False, "error": "eng_id는 필수입니다."}), 400

    for c in ["name","phone","department","grade","license","notes"]:
        df[c] = df[c].apply(normalize_text)

    for c in ["birth_date","join_date","leaving_expected_date","leave_date"]:
        df[c] = df[c].apply(normalize_date)

    df["overlapping_work"] = df["overlapping_work"].apply(normalize_overlapping)

    rows = df.to_dict(orient="records")
    total = len(rows)
    if total == 0:
        return jsonify({"ok": False, "error": "데이터 행이 없습니다."}), 400
    if total > 2000:
        return jsonify({"ok": False, "error": "한 번에 2000행을 초과할 수 없습니다."}), 400

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    # engineers 테이블 보장
    cur.execute("""
    CREATE TABLE IF NOT EXISTS engineers(
        eng_id TEXT PRIMARY KEY,
        name TEXT, birth_date TEXT, phone TEXT, department TEXT, grade TEXT, license TEXT,
        overlapping_work TEXT, join_date TEXT, leaving_expected_date TEXT, leave_date TEXT, notes TEXT,
        photo_path TEXT
    );
    """)

    inserted = 0
    try:
        for r in rows:
            cur.execute("""
                INSERT OR REPLACE INTO engineers
                (eng_id, name, birth_date, phone, department, grade, license,
                 overlapping_work, join_date, leaving_expected_date, leave_date, notes, photo_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT photo_path FROM engineers WHERE eng_id=?), NULL))
            """, (
                r["eng_id"], r["name"], r["birth_date"], r["phone"], r["department"],
                r["grade"], r["license"], r["overlapping_work"], r["join_date"],
                r["leaving_expected_date"], r["leave_date"], r["notes"], r["eng_id"]
            ))
            inserted += 1
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"ok": False, "error": f"DB 오류: {e}"}), 500
    finally:
        conn.close()

    return jsonify({"ok": True, "count": inserted})
