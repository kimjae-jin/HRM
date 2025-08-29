# -*- coding: utf-8 -*-
import os, sqlite3, datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "../database/hrm.db")

DDL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  project_id TEXT PRIMARY KEY,
  project_name TEXT,
  project_category TEXT,         -- PQ, 공공, 공공(하), 민간
  pm_name TEXT,
  project_location TEXT,
  summary TEXT,                  -- 70자 내 권장
  facility_type TEXT,
  status TEXT,                   -- 진행중, 중지중, 보류중, 완료
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contracts (
  contract_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  contract_type TEXT,            -- 최초, 변경, 차수분
  contract_date TEXT,
  start_date TEXT,
  end_date TEXT,
  total_amount REAL,
  supply_amount REAL,
  vat_amount REAL,
  total_equity_amount REAL,      -- = supply_amount + vat_amount
  equity_ratio REAL,             -- = total_equity_amount / total_amount
  contract_file_url TEXT,
  remarks TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contract_revisions (
  revision_id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  revision_date TEXT,
  revised_start_date TEXT,
  revised_end_date TEXT,
  final_end_date TEXT,
  revised_total_amount REAL,
  revised_total_equity_amount REAL,
  revised_equity_ratio REAL,
  revision_proof_file_url TEXT,
  revision_contract_file_url TEXT,
  change_reason TEXT,
  revision_number INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE
);

-- 자동저장(튕김 방지) 임시 저장소
CREATE TABLE IF NOT EXISTS project_drafts (
  draft_id TEXT PRIMARY KEY,
  project_id TEXT,               -- 저장 전 신규면 NULL 가능
  temp_key TEXT,                 -- 신규작성 식별자(브라우저 로컬 키)
  payload TEXT,                  -- JSON string
  editor_id TEXT,
  updated_at TEXT                -- ISO8601
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_revisions_contract ON contract_revisions(contract_id);
CREATE INDEX IF NOT EXISTS idx_drafts_project ON project_drafts(project_id);
CREATE INDEX IF NOT EXISTS idx_drafts_temp ON project_drafts(temp_key);
"""

def main():
  conn = sqlite3.connect(DB)
  try:
    conn.executescript(DDL)
    conn.commit()
    print("프로젝트/계약/변경이력/자동저장 테이블 생성 완료")
  finally:
    conn.close()

if __name__ == "__main__":
  main()
