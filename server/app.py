from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import sqlite3, os, io
from datetime import datetime
from openpyxl import Workbook

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "../database/hrm.db")

app = Flask(__name__)
CORS(app)

def conn():
  c = sqlite3.connect(DB_PATH)
  c.row_factory = sqlite3.Row
  return c

@app.route("/api/health")
def health():
  return {"ok": True}

# 기술인 목록
@app.route("/api/engineers")
def list_engineers():
  q = request.args.get("q","").strip()
  status = request.args.get("status","전체").strip()
  order = request.args.get("order","name")
  dir_ = request.args.get("dir","asc").lower()
  limit = int(request.args.get("limit","500"))
  if order not in ("name","department","grade","join_date"): order="name"
  if dir_ not in ("asc","desc"): dir_="asc"

  sql = "SELECT eng_id,name,department,grade,license,biz_license,join_date,phone,status FROM engineers"
  wh, prms = [], []
  if q:
    wh.append("(name LIKE ? OR department LIKE ? OR grade LIKE ?)")
    prms += [f"%{q}%", f"%{q}%", f"%{q}%"]
  if status and status!="전체":
    wh.append("IFNULL(status,'재직') = ?")
    prms.append(status)
  if wh: sql += " WHERE " + " AND ".join(wh)
  sql += f" ORDER BY {order} {dir_} LIMIT ?"
  prms.append(limit)

  with conn() as c:
    rows = [dict(r) for r in c.execute(sql, prms).fetchall()]
  return jsonify({"engineers": rows})

# 기술인 상세
@app.route("/api/engineers/<eng_id>")
def get_engineer(eng_id):
  with conn() as c:
    eng = c.execute("SELECT * FROM engineers WHERE eng_id=?", (eng_id,)).fetchone()
    if not eng:
      return jsonify({"error":"Engineer not found"}), 404
    edu  = [dict(x) for x in c.execute("SELECT * FROM education WHERE engineer_id=?", (eng_id,)).fetchall()]
    quals= [dict(x) for x in c.execute("SELECT * FROM qualifications WHERE engineer_id=?", (eng_id,)).fetchall()]
    car  = [dict(x) for x in c.execute("SELECT * FROM careers WHERE engineer_id=?", (eng_id,)).fetchall()]
    trn  = [dict(x) for x in c.execute("SELECT * FROM trainings WHERE engineer_id=?", (eng_id,)).fetchall()]
  return jsonify({
    "engineer": dict(eng),
    "education": edu,
    "qualifications": quals,
    "careers": car,
    "trainings": trn
  })

# 엑셀 템플릿(한글 헤더)
@app.route("/api/export/template.xlsx")
def export_template():
  wb = Workbook()
  ws = wb.active
  ws.title = "기술인"
  ws.append(["eng_id","성명","생년월일","연락처","부서","등급","자격사항","업/면허","업무중첩","입사일","퇴사예정일","퇴사일","상태","특이사항"])
  bio = io.BytesIO(); wb.save(bio); bio.seek(0)
  return send_file(bio, as_attachment=True, download_name="hrm_template.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# 전체 내보내기(간단)
@app.route("/api/export/all.xlsx")
def export_all():
  with conn() as c:
    rows = [dict(r) for r in c.execute("SELECT * FROM engineers ORDER BY name").fetchall()]
  wb = Workbook(); ws = wb.active; ws.title="기술인"
  if rows:
    ws.append(list(rows[0].keys()))
    for r in rows: ws.append([r.get(k,"") for k in rows[0].keys()])
  bio = io.BytesIO(); wb.save(bio); bio.seek(0)
  fn = f"hrm_all_{datetime.now().date()}.xlsx"
  return send_file(bio, as_attachment=True, download_name=fn, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

if __name__ == "__main__":
  port = int(os.environ.get("PORT","5050"))
  app.run(host="127.0.0.1", port=port, debug=True)
