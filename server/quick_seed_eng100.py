import sqlite3, os, datetime
DB = os.path.expanduser("~/Desktop/HRM/database/hrm.db")

WANT = {
  "eng_id": "ENG100",
  "name": "테스트",
  "resident_id": "900101-1234567",   # 주민등록번호
  "join_date": "2020-01-02",
  "address": "서울시 테스트구 1-1",
  "phone": "010-0000-0000",
  "department": "설계1팀",
  "status": "재직",
  "notes": "샘플",
}

def main():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cols = [r["name"] for r in cur.execute("PRAGMA table_info(engineers)")]
    if "eng_id" not in cols:
        raise SystemExit("engineers 테이블이 없습니다.")

    # 이미 있으면 스킵
    ex = cur.execute("SELECT 1 FROM engineers WHERE eng_id=?", (WANT["eng_id"],)).fetchone()
    if ex:
        print("ENG100 already exists.")
        return

    # 실제 존재하는 컬럼만 추려서 INSERT
    use_cols = [c for c in WANT.keys() if c in cols]
    placeholders = ",".join(["?"] * len(use_cols))
    sql = f'INSERT INTO engineers ({",".join(use_cols)}) VALUES ({placeholders})'
    cur.execute(sql, [WANT[c] for c in use_cols])

    # created_at/updated_at 컬럼이 있으면 채워줌
    now = datetime.datetime.utcnow().isoformat()
    for ts_col in ("created_at", "updated_at"):
        if ts_col in cols:
            cur.execute(f"UPDATE engineers SET {ts_col}=? WHERE eng_id=?", (now, WANT["eng_id"]))

    conn.commit()
    conn.close()
    print("ENG100 inserted with columns:", ",".join(use_cols))

if __name__ == "__main__":
    main()
