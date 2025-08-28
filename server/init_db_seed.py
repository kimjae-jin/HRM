# -*- coding: utf-8 -*-
import sqlite3, os, uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "../database/hrm.db")
os.makedirs(os.path.join(BASE_DIR, "../database"), exist_ok=True)

def uid(): return str(uuid.uuid4())

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.executescript("""
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS engineers(
  eng_id TEXT PRIMARY KEY,
  name TEXT, birth_date TEXT, phone TEXT,
  department TEXT, grade TEXT,
  license TEXT,              -- 자격사항
  biz_license TEXT,          -- 업/면허(회사)
  overlapping_work TEXT,
  join_date TEXT, leaving_expected_date TEXT, leave_date TEXT,
  status TEXT, notes TEXT
);

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

# 샘플
c.execute("DELETE FROM engineers")
c.execute("DELETE FROM education")
c.execute("DELETE FROM qualifications")
c.execute("DELETE FROM careers")
c.execute("DELETE FROM trainings")

engs = [
  ("ENG001","홍길동","1985-01-01","010-1111-2222","설계1팀","특급","토목기사","건(설계-일반)","N","2010-03-01",None,None,"재직","비고 없음"),
  ("ENG002","김민수","1990-05-12","010-3333-4444","감리2팀","고급","토목시공기술사","엔-도로","Y","2015-07-15",None,None,"재직","프로젝트 다수"),
]
c.executemany("""INSERT INTO engineers
(eng_id,name,birth_date,phone,department,grade,license,biz_license,overlapping_work,join_date,leaving_expected_date,leave_date,status,notes)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", engs)

c.execute("""INSERT INTO education VALUES (?,?,?,?,?,?,?,?,?)""",
          (uid(),"ENG001","서울대학교","토목공학","2003-03-01","2007-02-15","우수",None,None))
c.execute("""INSERT INTO qualifications VALUES (?,?,?,?,?,?,?,?)""",
          (uid(),"ENG001","토목기사","2008-06-20","A-12345","정상",None,None))
c.execute("""INSERT INTO careers VALUES (?,?,?,?,?,?,?,?,?)""",
          (uid(),"ENG001","OO엔지니어링","설계1팀","책임","한강교량기본설계","구조검토","2019-01-01","2020-06-30"))
c.execute("""INSERT INTO trainings VALUES (?,?,?,?,?,?)""",
          (uid(),"ENG001","안전관리교육","한국건설기술인협회","2023-05-01","2023-05-02"))

c.execute("""INSERT INTO education VALUES (?,?,?,?,?,?,?,?,?)""",
          (uid(),"ENG002","부산대학교","건설환경","2008-03-01","2012-02-15","논문 우수",None,None))
c.execute("""INSERT INTO qualifications VALUES (?,?,?,?,?,?,?,?)""",
          (uid(),"ENG002","토목시공기술사","2018-11-03","B-99999","정상",None,None))
c.execute("""INSERT INTO careers VALUES (?,?,?,?,?,?,?,?,?)""",
          (uid(),"ENG002","OO엔지니어링","감리2팀","책임","고속도로확장공사","품질감리","2021-03-01",None))
c.execute("""INSERT INTO trainings VALUES (?,?,?,?,?,?)""",
          (uid(),"ENG002","품질관리교육","KICT","2024-07-10","2024-07-11"))

conn.commit()
conn.close()
print("DB 초기화/시드 완료:", DB_PATH)
