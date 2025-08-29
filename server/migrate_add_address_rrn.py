import sqlite3, os, sys
BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "../database/hrm.db")

def has_col(conn, table, col):
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return any(r[1] == col for r in rows)

def main():
    conn = sqlite3.connect(DB)
    try:
        # address
        if not has_col(conn, "engineers", "address"):
            conn.execute("ALTER TABLE engineers ADD COLUMN address TEXT")
            print("engineers.address 컬럼 추가")
        else:
            print("engineers.address 이미 존재")

        # resident_reg_no (주민등록번호 - 원문 저장 주의: 운영 단계에서는 암호화/마스킹 권장)
        if not has_col(conn, "engineers", "resident_reg_no"):
            conn.execute("ALTER TABLE engineers ADD COLUMN resident_reg_no TEXT")
            print("engineers.resident_reg_no 컬럼 추가")
        else:
            print("engineers.resident_reg_no 이미 존재")

        conn.commit()
        print("마이그레이션 완료")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
