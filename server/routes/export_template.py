from flask import Blueprint, send_file
from openpyxl import Workbook
import os
import tempfile

export_bp = Blueprint("export_template", __name__)

@export_bp.route("/api/export/template.xlsx")
def export_template():
    # 요청하신 최종 필드 순서 (왼→오)
    headers = [
        "사번",
        "성명",
        "주민등록번호",
        "입사일",
        "주소",
        "전화번호",
        "부서명",
        "퇴사예정일",
        "퇴사일",
        "비고",
    ]

    wb = Workbook()
    ws = wb.active
    ws.title = "EngineersTemplate"
    ws.append(headers)

    # 임시파일에 저장 후 전송
    fd, tmp_path = tempfile.mkstemp(prefix="hrm_template_", suffix=".xlsx")
    os.close(fd)
    wb.save(tmp_path)

    return send_file(tmp_path, as_attachment=True, download_name="hrm_template.xlsx")
