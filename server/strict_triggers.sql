-- 프로젝트/재직 기간 불일치 참여 삽입 차단 (간단판: 기간 둘다 NULL 허용X)
CREATE TRIGGER IF NOT EXISTS trg_pp_insert_bounds
BEFORE INSERT ON project_participants
WHEN NEW.start_date IS NOT NULL
     AND NOT EXISTS (
        SELECT 1
        FROM project_periods pr
        JOIN engineer_employments ee
          ON ee.engineer_id = NEW.engineer_id
        WHERE pr.project_id = NEW.project_id
          AND pr.state = '진행중'
          AND COALESCE(NEW.end_date, '9999-12-31') >= pr.start_date
          AND COALESCE(pr.end_date, '9999-12-31')  >= NEW.start_date
          AND COALESCE(NEW.end_date, '9999-12-31') >= ee.start_date
          AND COALESCE(ee.end_date,'9999-12-31')   >= NEW.start_date
     )
BEGIN
    SELECT RAISE(ABORT, '참여기간이 프로젝트/재직기간과 불일치');
END;

-- (업데이트도 동일 논리로 추가 가능)
