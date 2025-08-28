# -*- coding: utf-8 -*-
import os, sqlite3, uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.abspath(os.path.join(BASE_DIR, "../database/hrm.db"))
print("[DB]", DB_PATH)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

# 외래키 활성화
c.execute("PRAGMA foreign_keys = ON;")

# ----- 테이블 생성 (없으면) -----
c.executescript("""
CREATE TABLE IF NOT EXISTS engineers (
    eng_id TEXT PRIMARY KEY,
    name TEXT,
    birth_date TEXT,
    phone TEXT,
    department TEXT,
    grade TEXT,
    license TEXT,
    overlapping_work TEXT,
    join_date TEXT,
    leaving_expected_date TEXT,
    leave_date TEXT,
    notes TEXT,
    photo_path TEXT
);

CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY,
    engineer_id TEXT NOT NULL,
    graduation_date TEXT,
    school_name TEXT,
    major TEXT,
    degree TEXT,
    notes TEXT,
    attachment_filename TEXT,
    attachment_path TEXT,
    FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_education_engineer_id ON education(engineer_id);

CREATE TABLE IF NOT EXISTS qualifications (
    id TEXT PRIMARY KEY,
    engineer_id TEXT NOT NULL,
    name TEXT,
    acquisition_date TEXT,
    number TEXT,
    issuer TEXT,
    notes TEXT,
    attachment_filename TEXT,
    attachment_path TEXT,
    FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_qualifications_engineer_id ON qualifications(engineer_id);

CREATE TABLE IF NOT EXISTS careers (
    id TEXT PRIMARY KEY,
    engineer_id TEXT NOT NULL,
    project_name TEXT,
    client_name TEXT,
    company_name TEXT,
    role_title TEXT,
    start_date TEXT,
    end_date TEXT,
    contract_amount INTEGER,
    participation_rate REAL,
    verification_status TEXT,
    notes TEXT,
    FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_careers_engineer_id ON careers(engineer_id);

CREATE TABLE IF NOT EXISTS trainings (
    id TEXT PRIMARY KEY,
    engineer_id TEXT NOT NULL,
    training_name TEXT,
    org_name TEXT,
    start_date TEXT,
    end_date TEXT,
    hours REAL,
    cert_number TEXT,
    attachment_filename TEXT,
    attachment_path TEXT,
    notes TEXT,
    FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_trainings_engineer_id ON trainings(engineer_id);

CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    engineer_id TEXT NOT NULL,
    category TEXT,         -- e.g., 'education','qualification','career'
    filename TEXT,
    path TEXT,
    notes TEXT,
    FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attachments_engineer_id ON attachments(engineer_id);

CREATE TABLE IF NOT EXISTS edit_locks(
    id INTEGER PRIMARY KEY CHECK (id=1),
    is_locked INTEGER DEFAULT 0,
    editor_id TEXT,
    locked_at TEXT
);
INSERT OR IGNORE INTO edit_locks (id, is_locked) VALUES (1, 0);
""")

# ----- 샘플 데이터 주입 -----
engineers = [
    ("ENG001","홍길동","1985-01-01","010-1111-2222","설계1팀","특급","토목기사","N","2010-03-01", None, None,"비고 없음", None),
    ("ENG002","김민수","1990-05-12","010-3333-4444","감리2팀","고급","기술사","Y","2015-07-15", None, None,"프로젝트 다수", None)
]
c.executemany("""
INSERT OR REPLACE INTO engineers
(eng_id,name,birth_date,phone,department,grade,license,overlapping_work,join_date,leaving_expected_date,leave_date,notes,photo_path)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
""", engineers)

def uid(): return str(uuid.uuid4())

# ENG001
c.execute("""INSERT OR REPLACE INTO education
(id, engineer_id, graduation_date, school_name, major, degree, notes, attachment_filename, attachment_path)
VALUES (?,?,?,?,?,?,?,?,?)""",
 (uid(),"ENG001","2007-02-15","서울대학교","토목공학","학사","우수",None,None))

c.execute("""INSERT OR REPLACE INTO qualifications
(id, engineer_id, name, acquisition_date, number, issuer, notes, attachment_filename, attachment_path)
VALUES (?,?,?,?,?,?,?,?,?)""",
 (uid(),"ENG001","토목기사","2008-06-20","A-12345","국가기술자격","정상",None,None))

# ENG002
c.execute("""INSERT OR REPLACE INTO education
(id, engineer_id, graduation_date, school_name, major, degree, notes, attachment_filename, attachment_path)
VALUES (?,?,?,?,?,?,?,?,?)""",
 (uid(),"ENG002","2012-02-15","부산대학교","건설환경","석사","논문 우수",None,None))

c.execute("""INSERT OR REPLACE INTO qualifications
(id, engineer_id, name, acquisition_date, number, issuer, notes, attachment_filename, attachment_path)
VALUES (?,?,?,?,?,?,?,?,?)""",
 (uid(),"ENG002","토목시공기술사","2018-11-03","B-99999","한국산업인력공단","정상",None,None))

conn.commit()
# 간단 확인
cnt_eng  = c.execute("SELECT COUNT(*) AS c FROM engineers").fetchone()["c"]
cnt_edu  = c.execute("SELECT COUNT(*) AS c FROM education").fetchone()["c"]
cnt_qual = c.execute("SELECT COUNT(*) AS c FROM qualifications").fetchone()["c"]
print(f"[OK] engineers={cnt_eng}, education={cnt_edu}, qualifications={cnt_qual}")
conn.close()
