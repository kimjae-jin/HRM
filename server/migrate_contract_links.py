# -*- coding: utf-8 -*-
import os, sqlite3, uuid, datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "../database/hrm.db")

def get_conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def table_exists(conn, name):
    return conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone() is not None

def cols(conn, table):
    try:
        return [r["name"] for r in conn.execute(f"PRAGMA table_info({table})")]
    except:
        return []

def has_col(conn, table, col):
    return col in cols(conn, table)

def ensure_projects(conn):
    if not table_exists(conn, "projects"):
        conn.execute("""
        CREATE TABLE projects(
          project_id TEXT PRIMARY KEY,
          project_name TEXT,
          project_category TEXT,
          pm_name TEXT,
          project_location TEXT,
          summary TEXT,
          facility_type TEXT,
          status TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at)")
        print("projects 테이블 생성")
    else:
        # 최소 컬럼 보강(없으면 추가)
        need = {
            "project_id":"TEXT",
            "project_name":"TEXT",
            "project_category":"TEXT",
            "pm_name":"TEXT",
            "project_location":"TEXT",
            "summary":"TEXT",
            "facility_type":"TEXT",
            "status":"TEXT",
            "created_at":"TEXT",
            "updated_at":"TEXT",
        }
        existing = cols(conn, "projects")
        for k,typ in need.items():
            if k not in existing:
                conn.execute(f"ALTER TABLE projects ADD COLUMN {k} {typ}")
                print(f"projects.{k} 컬럼 추가")

def ensure_contracts(conn):
    if not table_exists(conn, "contracts"):
        conn.execute("""
        CREATE TABLE contracts(
          contract_id TEXT PRIMARY KEY,
          project_id TEXT,
          contract_type TEXT,
          contract_date TEXT,
          start_date TEXT,
          end_date TEXT,
          total_amount REAL,
          supply_amount REAL,
          vat_amount REAL,
          total_equity_amount REAL,
          equity_ratio REAL,
          contract_file_url TEXT,
          remarks TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL
        )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_contracts_updated ON contracts(updated_at)")
        print("contracts 테이블 생성(표준 스키마)")
        return

    # 존재하면 필수 컬럼 보강
    need_cols = [
        ("contract_id","TEXT"),
        ("project_id","TEXT"),
        ("contract_type","TEXT"),
        ("contract_date","TEXT"),
        ("start_date","TEXT"),
        ("end_date","TEXT"),
        ("total_amount","REAL"),
        ("supply_amount","REAL"),
        ("vat_amount","REAL"),
        ("total_equity_amount","REAL"),
        ("equity_ratio","REAL"),
        ("contract_file_url","TEXT"),
        ("remarks","TEXT"),
        ("created_at","TEXT"),
        ("updated_at","TEXT"),
    ]
    existing = cols(conn, "contracts")

    # contract_id 없을 때: 추가하고 기존 PK(id)가 있으면 복사
    if "contract_id" not in existing:
        conn.execute("ALTER TABLE contracts ADD COLUMN contract_id TEXT")
        print("contracts.contract_id 컬럼 추가")
        # id 컬럼 있으면 복사해서 식별자 채움, 없으면 uuid 생성
        rows = conn.execute("SELECT rowid, * FROM contracts").fetchall()
        if "id" in existing:
            for r in rows:
                if not r["contract_id"]:
                    conn.execute("UPDATE contracts SET contract_id=? WHERE rowid=?", (r["id"], r["rowid"]))
        else:
            for r in rows:
                if not r["contract_id"]:
                    conn.execute("UPDATE contracts SET contract_id=? WHERE rowid=?", (str(uuid.uuid4()), r["rowid"]))
        conn.commit()
        # contract_id 유니크 인덱스 보강
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_contracts_contract_id ON contracts(contract_id)")

    # 나머지 부족 컬럼 추가
    existing = cols(conn, "contracts")
    for k,typ in need_cols:
        if k not in existing:
            conn.execute(f"ALTER TABLE contracts ADD COLUMN {k} {typ}")
            print(f"contracts.{k} 컬럼 추가")

def ensure_contract_projects(conn):
    conn.execute("""
    CREATE TABLE IF NOT EXISTS contract_projects(
      id TEXT PRIMARY KEY,
      contract_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      share_total_amount REAL,
      share_supply_amount REAL,
      share_vat_amount REAL,
      share_total_equity_amount REAL,
      share_equity_ratio REAL,
      remarks TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(contract_id, project_id),
      FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_cp_contract ON contract_projects(contract_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_cp_project  ON contract_projects(project_id)")
    print("contract_projects 테이블 준비 완료")

def safe(v, default=None):
    return v if v is not None else default

def backfill_links(conn):
    # contracts 에 project_id 가 채워진 레코드들을 연결테이블로 백필
    if not table_exists(conn, "contracts"): 
        return
    ec = cols(conn, "contracts")
    if "project_id" not in ec:
        return

    # 금액 컬럼 없으면 None 처리
    use_total  = "total_amount" in ec
    use_supply = "supply_amount" in ec
    use_vat    = "vat_amount" in ec
    use_te     = "total_equity_amount" in ec
    use_er     = "equity_ratio" in ec

    rows = conn.execute("SELECT * FROM contracts WHERE project_id IS NOT NULL").fetchall()
    n=0
    for r in rows:
        cid = r["contract_id"] if "contract_id" in ec else (r["id"] if "id" in ec else None)
        pid = r["project_id"]
        if not cid or not pid:
            continue
        exists = conn.execute("SELECT 1 FROM contract_projects WHERE contract_id=? AND project_id=?", (cid, pid)).fetchone()
        if exists: 
            continue
        st = r["total_amount"] if use_total else None
        ss = r["supply_amount"] if use_supply else None
        sv = r["vat_amount"] if use_vat else None
        ste= r["total_equity_amount"] if use_te else ( (safe(ss,0) + safe(sv,0)) if (ss is not None and sv is not None) else None )
        ser= r["equity_ratio"] if use_er else ( ( (float(ste)/float(st)) if (ste is not None and st not in (None,0)) else None ) )
        conn.execute("""
          INSERT OR IGNORE INTO contract_projects(
            id, contract_id, project_id, share_total_amount, share_supply_amount, share_vat_amount,
            share_total_equity_amount, share_equity_ratio, created_at, updated_at
          ) VALUES(?,?,?,?,?,?,?,?,?,?)
        """, (str(uuid.uuid4()), cid, pid, st, ss, sv, ste, ser, datetime.datetime.utcnow().isoformat(), datetime.datetime.utcnow().isoformat()))
        n+=1
    if n:
        print(f"연결 백필 {n}건 완료")

def main():
    conn = get_conn()
    try:
        ensure_projects(conn)
        ensure_contracts(conn)
        ensure_contract_projects(conn)
        backfill_links(conn)
        conn.commit()
        print("마이그레이션 완료")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
