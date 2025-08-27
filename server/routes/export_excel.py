# -*- coding: utf-8 -*-
from flask import Blueprint, send_file, jsonify
import sqlite3, os, io
import pandas as pd
from datetime import datetime

bp = Blueprint("export_excel", __name__)
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../database/hrm.db"))

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def table_exists(conn, name):
    row = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
    return bool(row)

def df_from_query(conn, sql, params=None):
    params = params or ()
    cur = conn.execute(sql, params)
    cols = [c[0] for c in cur.description]
    rows = cur.fetchall()
    data = [{cols[i]: r[i] for i in range(len(cols))} for r in rows]
    return pd.DataFrame(data, columns=cols)

HEADERS = {
    "Engineers": [
        ("eng_id", "eng_id"),
        ("name", "성명"),
        (None, "주민번호"),
        ("birth_date", "생년월일"),
        ("phone", "연락처"),
        ("department", "부서"),
        ("grade", "등급"),
        ("license", "면허"),
        ("join_date", "입사일"),
        ("leave_date", "퇴사일"),
        ("notes", "특이사항"),
        ("photo_path", "사진파일명"),
    ],
    "Careers": [
        ("id","id"),
        ("engineer_id","engineer_id"),
        ("project_name","공사명"),
        ("client_name","발주처"),
        ("company_name","소속기관"),
        ("role_title","직무"),
        ("start_date","시작일"),
        ("end_date","종료일"),
        ("contract_amount","계약금액(원)"),
        ("participation_rate","참여율(%)"),
        ("verification_status","검증상태"),
        ("notes","비고"),
    ],
    "Performances": [
        ("id","id"),
        ("engineer_id","engineer_id"),
        ("performance_name","실적명"),
        ("client_name","발주처"),
        ("role_title","역할"),
        ("start_date","시작일"),
        ("end_date","종료일"),
        ("scale","규모"),
        ("verification_status","검증상태"),
        ("notes","비고"),
    ],
    "Trainings": [
        ("id","id"),
        ("engineer_id","engineer_id"),
        ("training_name","교육명"),
        ("org_name","기관"),
        ("start_date","시작일"),
        ("end_date","종료일"),
        ("hours","이수시간"),
        ("cert_number","수료번호"),
        ("attachment_filename","첨부파일명"),
        ("notes","비고"),
    ],
    "Qualifications": [
        ("id","id"),
        ("engineer_id","engineer_id"),
        ("name","자격명"),
        ("number","자격번호"),
        ("acquisition_date","취득일"),
        ("issuer","발급기관"),
        ("attachment_filename","첨부파일명"),
        ("notes","비고"),
    ],
}

def make_sheet(conn, sheet_name, eng_id=None):
    if sheet_name == "Engineers":
        if not table_exists(conn, "engineers"):
            return pd.DataFrame(columns=[col for _, col in HEADERS["Engineers"]])
        df = df_from_query(conn, "SELECT * FROM engineers")
        if eng_id:
            df = df[df["eng_id"] == eng_id]
        cols_out = []
        out = {}
        for src, colname in HEADERS["Engineers"]:
            cols_out.append(colname)
            if src is None:
                out[colname] = ""
            else:
                out[colname] = df[src] if src in df.columns else ""
        return pd.DataFrame(out, columns=cols_out)

    def generic(table, pairs):
        if not table_exists(conn, table):
            return pd.DataFrame(columns=[col for _, col in pairs])
        if eng_id:
            df = df_from_query(conn, f"SELECT * FROM {table} WHERE engineer_id=?", (eng_id,))
        else:
            df = df_from_query(conn, f"SELECT * FROM {table}")
        cols_out = [out for _, out in pairs]
        out = {}
        for src, colname in pairs:
            out[colname] = df[src] if src in df.columns else ""
        return pd.DataFrame(out, columns=cols_out)

    if sheet_name == "Careers":         return generic("careers", HEADERS["Careers"])
    if sheet_name == "Performances":    return generic("performances", HEADERS["Performances"])
    if sheet_name == "Trainings":       return generic("trainings", HEADERS["Trainings"])
    if sheet_name == "Qualifications":  return generic("qualifications", HEADERS["Qualifications"])
    return pd.DataFrame()

def build_workbook(eng_id=None, template=False):
    sheets = list(HEADERS.keys())
    bio = io.BytesIO()
    with pd.ExcelWriter(bio, engine="openpyxl") as xw:
        if template:
            for s in sheets:
                cols = [out for _, out in HEADERS[s]]
                pd.DataFrame(columns=cols).to_excel(xw, sheet_name=s, index=False)
        else:
            with get_conn() as conn:
                for s in sheets:
                    df = make_sheet(conn, s, eng_id=eng_id)
                    df.to_excel(xw, sheet_name=s, index=False)
    bio.seek(0)
    return bio

@bp.route("/api/export/template.xlsx", methods=["GET"])
def export_template():
    wb = build_workbook(template=True)
    name = f"HRM_Template_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(wb, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     as_attachment=True, download_name=name)

@bp.route("/api/export/all.xlsx", methods=["GET"])
def export_all():
    wb = build_workbook(template=False)
    name = f"HRM_Export_All_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(wb, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     as_attachment=True, download_name=name)

@bp.route("/api/export/engineer/<eng_id>.xlsx", methods=["GET"])
def export_one(eng_id):
    wb = build_workbook(eng_id=eng_id, template=False)
    name = f"HRM_{eng_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(wb, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     as_attachment=True, download_name=name)
