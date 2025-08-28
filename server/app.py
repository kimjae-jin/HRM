from flask import Flask, jsonify, request, send_from_directory
import sqlite3, uuid, datetime, os
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "../database/hrm.db")
UPLOAD_ROOT = os.path.abspath(os.path.join(BASE_DIR, "../uploads"))
PROFILE_DIR = os.path.join(UPLOAD_ROOT, "profiles")
os.makedirs(PROFILE_DIR, exist_ok=True)

ALLOWED_EXTS = {"png", "jpg", "jpeg", "webp"}

def get_conn():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTS

@app.route("/files/<path:subpath>")
def serve_files(subpath):
    full_dir = UPLOAD_ROOT
    return send_from_directory(full_dir, subpath, as_attachment=False)

@app.route("/api/health")
def health():
    return {"ok": True}

@app.route("/api/engineers/<eng_id>", methods=["GET"])
def get_engineer(eng_id):
    conn = get_conn()
    try:
        eng = conn.execute("SELECT * FROM engineers WHERE eng_id = ?", (eng_id,)).fetchone()
        if not eng:
            return jsonify({"error": "Engineer not found"}), 404
        edu  = conn.execute("SELECT * FROM education WHERE engineer_id = ?", (eng_id,)).fetchall()
        qual = conn.execute("SELECT * FROM qualifications WHERE engineer_id = ?", (eng_id,)).fetchall()
        car  = conn.execute("SELECT * FROM careers WHERE engineer_id = ?", (eng_id,)).fetchall()
        trn  = conn.execute("SELECT * FROM trainings WHERE engineer_id = ?", (eng_id,)).fetchall()
        atts = conn.execute("SELECT * FROM attachments WHERE engineer_id = ?", (eng_id,)).fetchall()
        return jsonify({
            "engineer": dict(eng),
            "education": [dict(x) for x in edu],
            "qualifications": [dict(x) for x in qual],
            "careers": [dict(x) for x in car],
            "trainings": [dict(x) for x in trn],
            "attachments": [dict(x) for x in atts],
        })
    finally:
        conn.close()

@app.route("/api/engineers/<eng_id>/photo", methods=["POST"])
def upload_photo(eng_id):
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "no file"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"ok": False, "error": "empty filename"}), 400
    if not allowed(file.filename):
        return jsonify({"ok": False, "error": "unsupported type"}), 415

    ext = file.filename.rsplit(".", 1)[1].lower()
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
        conn.execute("UPDATE engineers SET photo_path=? WHERE eng_id=?", (url_path, eng_id))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True, "photo_path": url_path})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)), debug=True)
