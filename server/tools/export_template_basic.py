import os
import pandas as pd

BASE = os.path.expanduser("~/Desktop/HRM")
OUT = os.path.join(BASE, "hrm_basic_template.xlsx")

def main():
    cols = ["사번","성명","주민번호","입사일","주소","전화번호","퇴사예정일","퇴사일"]
    df = pd.DataFrame(columns=cols)
    # 예시 행 (삭제 가능)
    df.loc[0] = ["ENG001","홍길동","900101-1234567","2015-07-15","서울시 중구 세종대로 110","010-1234-5678","",""]

    with pd.ExcelWriter(OUT, engine="openpyxl") as w:
        df.to_excel(w, index=False, sheet_name="기본정보")

    print(f"템플릿 생성 완료: {OUT}")

if __name__ == "__main__":
    main()
