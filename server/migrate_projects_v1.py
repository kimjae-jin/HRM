# -*- coding: utf-8 -*-
import sqlite3, os

BASE = os.path.dirname(os.path.abspath(__file__))
DB   = os.path.join(BASE, "../database/hrm.db")

DDL = """
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,            -- 발주처/관계사/협력사 등
  biz_no TEXT,          -- 사업자번호
  contact TEXT,
  memo TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  code TEXT,            -- 사내 프로젝트 코드(선택)
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- 공공/공공(하)/민간/PQ/외주
  client_company_id TEXT,  -- 발주처(company FK)
  contract_no TEXT,
  contract_date TEXT,
  amount INTEGER,       -- 계약금액(원)
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT '진행',   -- 진행/완료/보류 등
  is_subcontract INTEGER DEFAULT 0,  -- 1이면 하도/외주
  parent_project_id TEXT,            -- 상위 원도급 프로젝트(있다면)
  FOREIGN KEY (client_company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_project_id)  REFERENCES projects(id)  ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

CREATE TABLE IF NOT EXISTS project_engineers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  engineer_id TEXT NOT NULL,
  role_title TEXT,
  participation_rate REAL,     -- %
  start_date TEXT,
  end_date TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_projeng_proj ON project_engineers(project_id);
CREATE INDEX IF NOT EXISTS idx_projeng_eng  ON project_engineers(engineer_id);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  issue_date TEXT,
  invoice_no TEXT,
  amount INTEGER,
  vat INTEGER,
  status TEXT,              -- 발행/취소/예정
  file_path TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_invoices_proj ON invoices(project_id);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  pay_date TEXT,
  amount INTEGER,
  io_type TEXT,            -- in/out (수금/지급)
  memo TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_payments_proj ON payments(project_id);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,          -- /files/contracts/xxx.pdf
  parsed_json TEXT,        -- 추출 결과(JSON 문자열, 추후 확장)
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_contracts_proj ON contracts(project_id);
"""

if __name__ == "__main__":
  conn = sqlite3.connect(DB)
  try:
    conn.executescript(DDL)
    conn.commit()
    print("projects v1 schema ready.")
  finally:
    conn.close()
