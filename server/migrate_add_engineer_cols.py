import sqlite3, os

DB = os.path.expanduser("~/Desktop/HRM/database/hrm.db")

NEEDED = {
    "birth_date": "TEXT",
    "rrn_masked": "TEXT",
    "phone": "TEXT",
    "address": "TEXT",
    "department": "TEXT",
    "grade": "TEXT",
    "license": "TEXT",
    "biz_license": "TEXT",
    "overlapping_work": "TEXT",
    "join_date": "TEXT",
    "leaving_expected_date": "TEXT",
    "leave_date": "TEXT",
    "status": "TEXT",
    "notes": "TEXT",
    "photo_path": "TEXT"
}

def main():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cols = {r[1] for r in cur.execute("PRAGMA table_info(engineers)").fetchall()}
    added = []
    for col, typ in NEEDED.items():
        if col not in cols:
            cur.execute(f"ALTER TABLE engineers ADD COLUMN {col} {typ}")
            added.append(col)
    conn.commit()
    conn.close()
    print("added:", ",".join(added) if added else "(none)")

if __name__ == "__main__":
    main()
