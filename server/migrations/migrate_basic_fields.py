import os, sqlite3

BASE = os.path.expanduser("~/Desktop/HRM")
DB = os.path.join(BASE, "database", "hrm.db")

DDL = """
-- 안전하게 컬럼 추가
PRAGMA foreign_keys = OFF;

-- engineers 테이블에 resident_id(주민번호), address(주소) 없으면 추가
ALTER TABLE engineers ADD COLUMN resident_id TEXT;
ALTER TABLE engineers ADD COLUMN address TEXT;

-- status 없으면(재직/휴직/퇴사예정/퇴사/삭제/삭제대기) 기본 재직
ALTER TABLE engineers ADD COLUMN status TEXT DEFAULT '재직';

PRAGMA foreign_keys = ON;
"""

def run():
    conn = sqlite3.connect(DB)
    try:
        c = conn.cursor()
        # 이미 존재하면 에러가 날 수 있으니, 있는지 점검 후 조건부 실행
        cols = {r[1] for r in c.execute("PRAGMA table_info(engineers)").fetchall()}
        if "resident_id" not in cols:
            c.execute("ALTER TABLE engineers ADD COLUMN resident_id TEXT")
        if "address" not in cols:
            c.execute("ALTER TABLE engineers ADD COLUMN address TEXT")
        if "status" not in cols:
            c.execute("ALTER TABLE engineers ADD COLUMN status TEXT DEFAULT '재직'")
        conn.commit()
        print("migrate_basic_fields: OK")
    finally:
        conn.close()

if __name__ == "__main__":
    run()
