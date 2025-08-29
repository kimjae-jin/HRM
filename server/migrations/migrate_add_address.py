# -*- coding: utf-8 -*-
import sqlite3, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "database", "hrm.db"))

def ensure_engineers_columns(conn):
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(engineers)")
    cols = {r[1] for r in cur.fetchall()}

    if "address" not in cols:
        conn.execute("ALTER TABLE engineers ADD COLUMN address TEXT")
        print("engineers.address 컬럼 추가")

    if "status" not in cols:
        conn.execute("ALTER TABLE engineers ADD COLUMN status TEXT DEFAULT '재직'")
        print("engineers.status 컬럼 추가")

    if "leaving_expected_date" not in cols:
        conn.execute("ALTER TABLE engineers ADD COLUMN leaving_expected_date TEXT")
        print("engineers.leaving_expected_date 컬럼 추가")

    if "leave_date" not in cols:
        conn.execute("ALTER TABLE engineers ADD COLUMN leave_date TEXT")
        print("engineers.leave_date 컬럼 추가")

    if "photo_path" not in cols:
        conn.execute("ALTER TABLE engineers ADD COLUMN photo_path TEXT")
        print("engineers.photo_path 컬럼 추가")

    if "biz_license" not in cols:
        conn.execute("ALTER TABLE engineers ADD COLUMN biz_license TEXT")
        print("engineers.biz_license 컬럼 추가")

    conn.commit()

def main():
    conn = sqlite3.connect(DB_PATH)
    try:
        ensure_engineers_columns(conn)
        print("OK: engineers 컬럼 보강 완료")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
