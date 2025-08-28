# -*- coding: utf-8 -*-
import sqlite3, os

DB = os.path.abspath(os.path.join(os.path.dirname(__file__), "../database/hrm.db"))

def column_exists(conn, table, col):
    rows = conn.execute(f"PRAGMA table_info({table});").fetchall()
    return any(r[1] == col for r in rows)

with sqlite3.connect(DB) as conn:
    conn.execute("PRAGMA foreign_keys = ON;")
    if not column_exists(conn, "engineers", "photo_path"):
        conn.execute("ALTER TABLE engineers ADD COLUMN photo_path TEXT;")
        conn.commit()
        print("engineers.photo_path 컬럼 추가 완료")
    else:
        print("engineers.photo_path 이미 존재")
