# -*- coding: utf-8 -*-
import sqlite3, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
DB   = os.path.join(BASE, "../database/hrm.db")

def has_col(conn, table, col):
    cur = conn.execute(f"PRAGMA table_info({table})")
    return any(r[1] == col for r in cur.fetchall())

def ensure_col(conn, table, col, ddl):
    if not has_col(conn, table, col):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        return True
    return False

if __name__ == "__main__":
    conn = sqlite3.connect(DB)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        added = []
        if ensure_col(conn, "engineers", "photo_path", "photo_path TEXT"):
            added.append("photo_path")
        # 안전망: 혹시 누락된 컬럼이 있으면 같이 보강
        if ensure_col(conn, "engineers", "biz_license", "biz_license TEXT"):
            added.append("biz_license")
        if ensure_col(conn, "engineers", "status", "status TEXT DEFAULT '재직'"):
            added.append("status")
        conn.commit()
        if added:
            print("추가된 컬럼:", ", ".join(added))
        else:
            print("변경 없음(이미 최신 스키마).")
    finally:
        conn.close()
