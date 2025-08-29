# -*- coding: utf-8 -*-
import sqlite3, os, json, datetime

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.abspath(os.path.join(BASE, "../database/hrm.db"))

def _conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def date_or(d, default):
    return d if d else default

def overlap(a1, a2, b1, b2):
    # 문자열 'YYYY-MM-DD' 가정
    A1 = datetime.date.fromisoformat(date_or(a1, "0001-01-01"))
    A2 = datetime.date.fromisoformat(date_or(a2, "9999-12-31"))
    B1 = datetime.date.fromisoformat(date_or(b1, "0001-01-01"))
    B2 = datetime.date.fromisoformat(date_or(b2, "9999-12-31"))
    s = max(A1, B1); e = min(A2, B2)
    return (e - s).days + 1 if s <= e else 0

def check_participation_bounds(participant):
    """
    참여행이 엔지니어 재직 + 프로젝트 진행 기간과 교집합을 가지는지 검사.
    불일치 시 (조정안, 에러메시지) 반환
    """
    with _conn() as conn:
        # 1) 프로젝트 진행 기간 (state='진행중')
        rows_proj = conn.execute("""
            SELECT start_date, end_date
            FROM project_periods
            WHERE project_id=? AND state='진행중'
        """, (participant["project_id"],)).fetchall()

        # 프로젝트 기간이 없으면 경고(운영 중에는 진행중 기간 최소 1행 존재 권장)
        if not rows_proj:
            return (None, "프로젝트 진행중 기간 없음")

        # 2) 엔지니어 재직기간
        rows_emp = conn.execute("""
            SELECT start_date, end_date
            FROM engineer_employments
            WHERE engineer_id=?
        """, (participant["engineer_id"],)).fetchall()

        if not rows_emp:
            return (None, "엔지니어 재직이력 없음")

        ps, pe = participant["start_date"], participant["end_date"]

        # 교집합 있는지 확인
        ok = False
        for pr in rows_proj:
            for er in rows_emp:
                if overlap(ps, pe, pr["start_date"], pr["end_date"]) and \
                   overlap(ps, pe, er["start_date"], er["end_date"]):
                    ok = True
                    break
            if ok: break

        return (participant if ok else None,
                None if ok else "참여기간이 프로젝트/재직기간과 불일치")

def calc_overlap_warnings(engineer_id, when=None):
    """
    특정 날짜(when) 기준 또는 오늘 기준으로, 동일 엔지니어의 allocation_pct 합계가 100 초과인지 체크
    when: 'YYYY-MM-DD' (None이면 오늘)
    """
    ref = when or datetime.date.today().isoformat()
    with _conn() as conn:
        rows = conn.execute("""
          SELECT allocation_pct
          FROM project_participants
          WHERE engineer_id=?
            AND COALESCE(start_date,'0001-01-01') <= ?
            AND COALESCE(end_date,'9999-12-31')   >= ?
        """, (engineer_id, ref, ref)).fetchall()

        s = sum([r["allocation_pct"] or 0 for r in rows])
        return (s, s > 100.0)

def auto_compute_grade(engineer_id):
    """
    자동등급 산정(샘플):
    - qualifications(자격) + trainings(교육) 데이터 기반으로 포인트 합산 → 등급 매핑
    실제 건진법 상세 규칙은 JSON(rule_json)에 정의, 여기선 예시 구현.
    """
    with _conn() as conn:
        # 규칙 읽기(가장 최신 1개)
        gr = conn.execute("SELECT rule_json FROM grade_rules ORDER BY rowid DESC LIMIT 1").fetchone()
        rule = json.loads(gr["rule_json"]) if gr else {
            "points": {
                "qualification": {"기술사": 70, "기사": 40, "산업기사": 25},
                "training_days_per_year": 2,  # 연간 교육 1일=2점 예시
            },
            "grade_boundaries": [
                {"min": 90, "grade": "특급"},
                {"min": 70, "grade": "고급"},
                {"min": 50, "grade": "중급"},
                {"min": 0,  "grade": "초급"}
            ]
        }

        # 자격 포인트
        qrows = conn.execute("""
            SELECT name FROM qualifications WHERE engineer_id=?
        """, (engineer_id,)).fetchall()
        qpts = 0
        for r in qrows:
            nm = r["name"] or ""
            for key, val in rule["points"]["qualification"].items():
                if key in nm:
                    qpts = max(qpts, val)  # 최고자격만 반영 예시
        # 교육 일수 → 포인트
        # (연도별 집계 예시: 최근 3년 합/3 등, 여기선 총합 일수 * 계수)
        trows = conn.execute("""
            SELECT training_date FROM trainings WHERE engineer_id=?
        """, (engineer_id,)).fetchall()
        tdays = len(trows)  # 1회=1일로 근사 (향후 duration 컬럼 도입 권장)
        tpts = tdays * rule["points"]["training_days_per_year"]

        total = qpts + tpts
        grade = "초급"
        for b in rule["grade_boundaries"]:
            if total >= b["min"]:
                grade = b["grade"]; break

        conn.execute("UPDATE engineers SET grade=? WHERE eng_id=?", (grade, engineer_id))
        conn.commit()
        return {"engineer_id": engineer_id, "points_total": total, "grade": grade}

def reconcile_participant(participant_id):
    """ 단일 참여행을 정책과 대조하여 검증 및 경고/보정 리포트 반환 """
    with _conn() as conn:
        row = conn.execute("""
          SELECT * FROM project_participants WHERE participant_id=?
        """, (participant_id,)).fetchone()
        if not row:
            return {"ok": False, "msg": "participant not found"}

        okrow, msg = check_participation_bounds(row)
        s, warn = calc_overlap_warnings(row["engineer_id"])
        return {
            "ok": okrow is not None,
            "bounds_msg": msg,
            "overlap_sum_today": s,
            "overlap_warn": warn
        }
