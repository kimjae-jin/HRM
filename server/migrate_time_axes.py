# -*- coding: utf-8 -*-
import sqlite3, os, uuid

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.abspath(os.path.join(BASE, "../database/hrm.db"))

def up():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    # 1) 엔지니어 입/퇴사 이력 (기간축)
    c.execute("""
    CREATE TABLE IF NOT EXISTS engineer_employments (
        id TEXT PRIMARY KEY,
        engineer_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date   TEXT,               -- NULL이면 현재 재직
        status     TEXT NOT NULL,      -- 재직/휴직/퇴사예정/퇴사 등
        UNIQUE(engineer_id, start_date),
        FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
    );
    """)

    # 2) 프로젝트 상태 기간 (중지/재개 포함)
    c.execute("""
    CREATE TABLE IF NOT EXISTS project_periods (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date   TEXT,               -- NULL이면 진행중
        state      TEXT NOT NULL,      -- 진행중/중지중/보류중/완료
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    );
    """)

    # 3) 프로젝트 참여정보(기간 + 배분율 + 직무/분야)
    # 존재한다면 컬럼만 보강
    c.execute("""
    CREATE TABLE IF NOT EXISTS project_participants (
        participant_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        engineer_id TEXT NOT NULL,
        role TEXT,                -- 직무
        specialty TEXT,           -- 전문분야
        position TEXT,            -- 직책
        responsibility TEXT,      -- 담당업무
        responsibility_level TEXT,
        start_date TEXT,          -- 참여시작
        end_date   TEXT,          -- 참여종료(NULL: 참여중)
        allocation_pct REAL DEFAULT 100.0,  -- 중복도 계산용 배분율(%) - 기본 100
        notes TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
        FOREIGN KEY (engineer_id) REFERENCES engineers(eng_id) ON DELETE CASCADE
    );
    """)

    # 누락 컬럼 보강(ALTER IF NOT EXISTS 대체: 에러시 무시)
    def addcol(tbl, col, ddl):
        try:
            c.execute(f"ALTER TABLE {tbl} ADD COLUMN {col} {ddl};")
        except sqlite3.OperationalError:
            pass

    addcol("project_participants", "start_date", "TEXT")
    addcol("project_participants", "end_date", "TEXT")
    addcol("project_participants", "allocation_pct", "REAL DEFAULT 100.0")
    addcol("project_participants", "role", "TEXT")
    addcol("project_participants", "specialty", "TEXT")
    addcol("project_participants", "position", "TEXT")
    addcol("project_participants", "responsibility", "TEXT")
    addcol("project_participants", "responsibility_level", "TEXT")

    # 4) 엔지니어 자동등급 규칙(가변) - 샘플 규칙 테이블
    c.execute("""
    CREATE TABLE IF NOT EXISTS grade_rules (
        id TEXT PRIMARY KEY,
        rule_name TEXT NOT NULL,     -- 규칙명
        rule_json TEXT NOT NULL      -- JSON(가중치/요건) : 백엔드에서 해석
    );
    """)

    # 5) 무결성 트리거: 참가기간이 프로젝트 '진행중' 기간을 벗어나면 불가
    # (간단판) start_date/end_date가 프로젝트 기간 어떤 구간과도 겹치지 않으면 차단
    c.executescript("""
    CREATE TABLE IF NOT EXISTS _cfg (k TEXT PRIMARY KEY, v TEXT);
    """)
    # 프로젝트 기간 없거나 사후 등록될 수 있으므로, 백엔드 재계산에서도 보정

    # 6) 뷰: 엔지니어별 날짜 단위 중복도 집계용(월 단위 근사)
    # SQLite는 날짜 확장이 약하므로, 쿼리는 백엔드에서 동적 구성 권장.
    # 여기서는 현재 활성 참여 행을 빠르게 훑기 위한 뷰만 제공.
    c.execute("""
    CREATE VIEW IF NOT EXISTS v_active_participations AS
    SELECT
      pp.participant_id, pp.engineer_id, pp.project_id,
      COALESCE(pp.allocation_pct,100) AS allocation_pct,
      pp.start_date, pp.end_date
    FROM project_participants pp
    WHERE COALESCE(pp.end_date, '9999-12-31') >= date('now')
      AND COALESCE(pp.start_date, '0001-01-01') <= date('now');
    """)

    conn.commit()
    conn.close()
    print("migrate_time_axes: OK")

if __name__ == "__main__":
    up()
