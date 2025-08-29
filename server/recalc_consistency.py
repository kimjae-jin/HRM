# -*- coding: utf-8 -*-
import os, sqlite3, json
from utils_time_axes import _conn, reconcile_participant, auto_compute_grade

def scan_all():
    out = {"participants": [], "grades": []}
    with _conn() as conn:
        parts = conn.execute("SELECT participant_id FROM project_participants").fetchall()
        engs  = conn.execute("SELECT eng_id FROM engineers").fetchall()

    for p in parts:
        out["participants"].append({
            "participant_id": p["participant_id"],
            **reconcile_participant(p["participant_id"])
        })
    for e in engs:
        out["grades"].append(auto_compute_grade(e["eng_id"]))
    return out

if __name__ == "__main__":
    report = scan_all()
    print(json.dumps(report, ensure_ascii=False, indent=2))
