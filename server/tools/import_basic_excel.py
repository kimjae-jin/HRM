import os, sqlite3
import pandas as pd

BASE = os.path.expanduser("~/Desktop/HRM")
DB = os.path.join(BASE, "database", "hrm.db")

REQ_COLS = ["사번","성명","주민번호","입사일","주소","전화번호","퇴사예정일","퇴사일"]

def upsert_engineer(c, row):
    eng_id = str(row["사번"]).strip()
    name   = str(row["성명"]).strip()
    resid  = str(row["주민번호"]).strip()
    join   = str(row["입사일"]).strip()
    addr   = str(row["주소"]).strip()
    phone  = str(row["전화번호"]).strip()
    leave_expected = str(row["퇴사예정일"]).strip() if pd.notna(row["퇴사예정일"]) else None
    leave_date     = str(row["퇴사일"]).strip() if pd.notna(row["퇴사일"]) else None

    cur = c.execute("SELECT eng_id FROM engineers WHERE eng_id=?", (eng_id,)).fetchone()
    if cur:
        c.execute("""
          UPDATE engineers
             SET name=?, resident_id=?, join_date=?, address=?, phone=?,
                 leaving_expected_date=?, leave_date=?
           WHERE eng_id=?
        """, (name, resid, join, addr, phone, leave_expected, leave_date, eng_id))
    else:
        c.execute("""
          INSERT INTO engineers
          (eng_id, name, resident_id, join_date, address, phone,
           leaving_expected_date, leave_date, status)
          VALUES (?,?,?,?,?,?,?,?, '재직')
        """, (eng_id, name, resid, join, addr, phone, leave_expected, leave_date))

def main(xlsx_path):
    if not os.path.exists(xlsx_path):
        raise SystemExit(f"엑셀 파일 없음: {xlsx_path}")

    df = pd.read_excel(xlsx_path, sheet_name="기본정보", dtype=str)
    cols = list(df.columns)
    missing = [c for c in REQ_COLS if c not in cols]
    if missing:
        raise SystemExit(f"필수 컬럼 누락: {missing}")

    conn = sqlite3.connect(DB)
    try:
        c = conn.cursor()
        cnt = 0
        for _, r in df.iterrows():
            upsert_engineer(c, r)
            cnt += 1
        conn.commit()
        print(f"{cnt}건 반영 완료")
    finally:
        conn.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("사용법: python import_basic_excel.py <엑셀파일>")
        sys.exit(1)
    main(sys.argv[1])
