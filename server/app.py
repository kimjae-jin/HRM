
from flask import Flask, request, jsonify
import sqlite3
from sqlite3 import Error
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = '../database/hrm.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/engineers/<eng_id>', methods=['GET'])
def get_engineer(eng_id):
    conn = get_db_connection()
    engineer = conn.execute('SELECT * FROM engineers WHERE eng_id = ?', (eng_id,)).fetchone()
    conn.close()
    if engineer:
        return jsonify(dict(engineer))
    return jsonify({'error': 'Engineer not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
