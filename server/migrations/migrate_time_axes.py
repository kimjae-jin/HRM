import os, sqlite3, sys, json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.abspath(os.path.join(BASE_DIR, "../../database/hrm.db"))

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def table_exists(conn, name):
    r = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
    return r is not None

def column_exists(conn, table, column):
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return any(row["name"] == column for row in rows)

def index_exists(conn, name):
    r = conn.execute("SELECT name FROM sqlite_master WHERE type='index' AND name=?", (name,)).fetchone()
    return r is not None

def ensure_column(conn, table, column, coltype):
    if not table_exists(conn, table):
        raise RuntimeError(f"Table '{table}' does not exist.")
    if not column_exists(conn, table, column):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}")
        return True
    return False

def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if not os.path.exists(DB_PATH):
        print(json.dumps({"ok": False, "error": f"DB not found: {DB_PATH}"}))
        sys.exit(1)

    changed = {"columns_added": [], "indexes_created": []}
    with get_conn() as conn:
        # 1) trainings.training_date 추가
        try:
            if ensure_column(conn, "trainings", "training_date", "TEXT"):
                changed["columns_added"].append("trainings.training_date")
        except RuntimeError as e:
            print(json.dumps({"ok": False, "error": str(e)}))
            sys.exit(1)

        # 2) 인덱스들(있으면 건너뜀)
        if not index_exists(conn, "idx_trainings_engineer_id"):
            conn.execute("CREATE INDEX idx_trainings_engineer_id ON trainings(engineer_id)")
            changed["indexes_created"].append("idx_trainings_engineer_id")
        if not index_exists(conn, "idx_trainings_training_date"):
            conn.execute("CREATE INDEX idx_trainings_training_date ON trainings(training_date)")
            changed["indexes_created"].append("idx_trainings_training_date")

        conn.commit()

    print(json.dumps({"ok": True, "db": DB_PATH, **changed}, ensure_ascii=False))

if __name__ == "__main__":
    main()
