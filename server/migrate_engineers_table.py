# -*- coding: utf-8 -*-
import sqlite3, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "../database/hrm.db")

NEEDED = [
  ("birth_date", "TEXT"),
  ("phone", "TEXT"),
  ("department", "TEXT"),
  ("grade", "TEXT"),
  ("license", "TEXT"),       # 자격사항
  ("biz_license", "TEXT"),   # 업/면허
  ("overlapping_work", "TEXT"),
  ("join_date", "TEXT"),
  ("leaving_expected_date", "TEXT"),
  ("leave_date", "TEXT"),
  ("status", "TEXT"),
  ("notes", "TEXT"),
]

def ensure_children(cur):
    # 하위 테이블도 없으면 생성(안전)
    cur.executescript("""
    PRAGMA foreign_keys=ON;

    CREATE TABLE IF NOT EXISTS education(
      id TEXT PRIMARY KEY,
      engineer_id TEXT NOT NULL,
      school_name TEXT, major TEXT,
      start_date TEXT, graduation_date TEXT,
      notes TEXT,
      attachment_filename TEXT, attachment_path TEXT,
      FOREIGN KEY(engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_edu_eng ON education(engineer_id);

    CREATE TABLE IF NOT EXISTS qualifications(
      id TEXT PRIMARY KEY,
      engineer_id TEXT NOT NULL,
      name TEXT, acquisition_date TEXT, number TEXT, notes TEXT,
      attachment_filename TEXT, attachment_path TEXT,
      FOREIGN KEY(engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_qual_eng ON qualifications(engineer_id);

    CREATE TABLE IF NOT EXISTS careers(
      id TEXT PRIMARY KEY,
      engineer_id TEXT NOT NULL,
      company TEXT, department TEXT, position TEXT,
      project_name TEXT, role TEXT,
      start_date TEXT, end_date TEXT,
      FOREIGN KEY(engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_car_eng ON careers(engineer_id);

    CREATE TABLE IF NOT EXISTS trainings(
      id TEXT PRIMARY KEY,
      engineer_id TEXT NOT NULL,
      title TEXT, institution TEXT,
      start_date TEXT, end_date TEXT,
      FOREIGN KEY(engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_trn_eng ON trainings(engineer_id);
    """)

def main():
    if not os.path.exists(DB_PATH):
        print("DB 파일이 없어 새로 만들 필요가 있습니다:", DB_PATH)
        return
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    # engineers가 없으면 생성(최소 스키마)
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='engineers'")
    if not cur.fetchone():
        cur.execute("""
        CREATE TABLE engineers(
          eng_id TEXT PRIMARY KEY,
          name TEXT
        )""")
        print("engineers 테이블이 없어 기본 스키마로 생성했습니다.")

    # 현재 컬럼 집합
    cur.execute("PRAGMA table_info(engineers)")
    have = {row[1] for row in cur.fetchall()}  # row[1] = name

    # 누락 컬럼 추가
    added = []
    for col, typ in NEEDED:
      if col not in have:
        cur.execute(f"ALTER TABLE engineers ADD COLUMN {col} {typ}")
        added.append(col)

    ensure_children(cur)
    con.commit()
    con.close()
    if added:
        print("추가된 컬럼:", ", ".join(added))
    else:
        print("추가된 컬럼 없음(이미 최신 스키마).")

if __name__ == "__main__":
    main()
