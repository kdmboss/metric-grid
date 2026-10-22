import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG = """boot noise
{"type":"device","id":"hearth-1","name":"Living room"}
{"type":"event","start":1760929920,"end":1760941440,"temp_start":71.2,"temp_end":63.9}
{"type":"event","start":1760929920,"end":1760941440,"temp_start":71.2,"temp_end":63.9}
{"type":"event","start":1760900000,"end":1760900600,"temp_start":-100.0,"temp_end":65.0}
{"type":"reading","t":1760942000,"temp":64.5}
{"type":"reading","t":1760942300,"temp":65.1}
{"type":"end"}
"""


def test_export_writes_frozen_files(tmp_path):
    log = tmp_path / "serial.log"
    log.write_text(LOG)
    out = tmp_path / "frozen"
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "device_export.py"), str(log), "--out", str(out), "--name", "Bedroom"],
        check=True,
    )
    events = json.loads((out / "device_events.json").read_text())
    readings = json.loads((out / "device_readings.json").read_text())
    assert events["device"]["name"] == "Bedroom"
    assert len(events["events"]) == 1  # duplicate dropped, no-probe event dropped
    event = events["events"][0]
    assert event["start"] == "2025-10-20T03:12:00" and event["end"] == "2025-10-20T06:24:00"
    assert (event["temp_start_f"], event["temp_end_f"]) == (71.2, 63.9)
    assert [r["temp_f"] for r in readings["readings"]] == [64.5, 65.1]
