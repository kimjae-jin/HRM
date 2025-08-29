import os, sqlite3, json, sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.abspath(os.path.join(BASE_DIR, "../../database/hrm.db"))

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def table_exists(conn, name):
    return conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone() is not None

def column_exists(conn, table, column):
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return any(r["name"] == column for r in rows)

def ensure_column(conn, table, column, coltype):
    if not table_exists(conn, table):
        return False, f"table '{table}' not found"
    if not column_exists(conn, table, column):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}")
        return True, None
    return False, None

def main():
    if not os.path.exists(DB_PATH):
        print(json.dumps({"ok": False, "error": f"DB not found: {DB_PATH}"}))
        sys.exit(1)

    changes = {"added": [], "warnings": []}
    with get_conn() as conn:
        added, warn = ensure_column(conn, "engineers", "status", "TEXT DEFAULT '재직'")
        if added: changes["added"].append("engineers.status")
        if warn:  changes["warnings"].append(warn)

        added, warn = ensure_column(conn, "engineers", "photo_path", "TEXT")
        if added: changes["added"].append("engineers.photo_path")
        if warn:  changes["warnings"].append(warn)

        conn.commit()

    print(json.dumps({"ok": True, **changes}, ensure_ascii=False))

if __name__ == "__main__":
    main()
