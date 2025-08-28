# -*- coding: utf-8 -*-
import sqlite3, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "../database/hrm.db")

def column_exists(conn, table, col):
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    names = [r[1] for r in rows]
    return col in names

def main():
    conn = sqlite3.connect(DB)
    try:
        conn.execute("PRAGMA foreign_keys=ON;")
        # engineers.status 없으면 추가
        if not column_exists(conn, "engineers", "status"):
            conn.execute("ALTER TABLE engineers ADD COLUMN status TEXT DEFAULT '재직'")
            conn.commit()
            print("engineers.status 컬럼 추가 완료 (기본값: 재직)")
        else:
            print("engineers.status 이미 존재")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
