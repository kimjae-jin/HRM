from flask import Blueprint, request, jsonify
import sqlite3, os

admin_bp = Blueprint("admin", __name__, url_prefix="/api")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "../database/hrm.db")

def get_conn():
  conn = sqlite3.connect(DATABASE)
  conn.row_factory = sqlite3.Row
  return conn

@admin_bp.route("/engineers", methods=["DELETE"])
def delete_engineers_bulk():
  """선택된 사번들을 소프트삭제(status='삭제')로 변경"""
  payload = request.get_json(force=True)
  ids = payload.get("ids", [])
  if not ids:
    return jsonify({"ok": False, "error": "no ids"}), 400
  qmarks = ",".join(["?"] * len(ids))
  conn = get_conn()
  try:
    conn.execute(f"UPDATE engineers SET status='삭제' WHERE eng_id IN ({qmarks})", ids)
    conn.commit()
    return jsonify({"ok": True, "count": len(ids)})
  finally:
    conn.close()

@admin_bp.route("/admin/delete_sample_data", methods=["POST"])
def delete_sample_data():
  """
  샘플(테스트* 이름 / ENG00* 사번) 삭제
  - 불러오기/시연용 더미 데이터 제거용
  """
  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute("DELETE FROM engineers WHERE name LIKE '테스트%'")
    cur.execute("DELETE FROM engineers WHERE eng_id LIKE 'ENG00%'")
    deleted = cur.rowcount
    conn.commit()
    return jsonify({"ok": True, "deleted_rows": deleted})
  finally:
    conn.close()
