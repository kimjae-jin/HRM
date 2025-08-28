# -*- coding: utf-8 -*-
import sqlite3, os, datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "../database/hrm.db")

conn = sqlite3.connect(DB)
c = conn.cursor()
c.execute("PRAGMA foreign_keys = ON;")

# 정책: 면허코드별 요구치 (나라장터 기준을 여기서 관리)
c.execute("""
CREATE TABLE IF NOT EXISTS license_policies (
  code TEXT PRIMARY KEY,         -- 예: ENG-ROAD (엔-도로)
  name TEXT NOT NULL,            -- 예: 엔지니어링(도로)
  required_to   INTEGER,         -- T/O (총원)
  required_po   INTEGER,         -- P/O (전문/기술사 등 법정 요건 인원)
  required_todp INTEGER,         -- T/odp (지정기술인/책임자 등 별도요건)
  keywords      TEXT,            -- 엔-도로, 도로및공항 등: engineer.biz_license에 포함되면 이 정책 매칭
  notes         TEXT
);
""")

# 회사 현재 지표: 운영 시 수시 갱신
c.execute("""
CREATE TABLE IF NOT EXISTS company_metrics (
  code TEXT PRIMARY KEY,         -- 정책 code와 매칭
  current_to   INTEGER DEFAULT 0,
  current_po   INTEGER DEFAULT 0,
  current_todp INTEGER DEFAULT 0,
  updated_at   TEXT
);
""")

# engineers 테이블에 biz_license 컬럼이 없으면 생성 (이미 있으면 무시)
c.execute("PRAGMA table_info(engineers);")
cols = [r[1] for r in c.fetchall()]
if "biz_license" not in cols:
  c.execute("ALTER TABLE engineers ADD COLUMN biz_license TEXT;")

# 샘플 시드 (자유롭게 수정하세요)
# 키워드는 engineer.biz_license 문자열에 포함되면 매칭됩니다.
policies = [
  ("ENG-ROAD", "엔지니어링(도로)", 5, 2, 1, "엔-도로,도로및공항", "예시값입니다. 실제 요구치는 법규에 맞춰 수정하세요."),
  ("ENG-WATER", "엔지니어링(상하수도)", 4, 1, 1, "엔-상,상하수도", "예시값입니다. 실제 요구치는 법규에 맞춰 수정하세요."),
  ("CONS-DESIGN", "건설엔지니어링(설계-일반)", 6, 2, 1, "건,설계-일반", "예시값입니다. 실제 요구치는 법규에 맞춰 수정하세요.")
]
for p in policies:
  c.execute("INSERT OR IGNORE INTO license_policies(code,name,required_to,required_po,required_todp,keywords,notes) VALUES (?,?,?,?,?,?,?)", p)

metrics = [
  ("ENG-ROAD", 4, 2, 1, datetime.datetime.utcnow().isoformat()),    # 일부 미달: T/O가 4 < 5
  ("ENG-WATER", 6, 2, 2, datetime.datetime.utcnow().isoformat()),   # 충족
  ("CONS-DESIGN", 6, 1, 1, datetime.datetime.utcnow().isoformat())  # P/O 미달
]
for m in metrics:
  c.execute("INSERT OR REPLACE INTO company_metrics(code,current_to,current_po,current_todp,updated_at) VALUES (?,?,?,?,?)", m)

conn.commit()
conn.close()
print("license_policies / company_metrics 테이블 및 샘플 시드 완료")
