#!/usr/bin/env python3
"""Turn a saved serial log from the HEARTH Home firmware (`EXPORT` command) into the frozen files the app reads.

Usage: python3 scripts/device_export.py serial.log [--name "Living room"]

The firmware prints JSON lines. The RTC counts local wall-clock time, so its epoch seconds are converted
to naive local ISO strings ("2026-10-20T03:12:00"), which is what the app expects.
Writes data/frozen/device_events.json and data/frozen/device_readings.json.
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def iso(epoch: int) -> str:
    return datetime.fromtimestamp(int(epoch), tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")


def parse(lines):
    device, events, readings = {}, [], {}
    for raw in lines:
        raw = raw.strip()
        if not raw.startswith("{"):
            continue  # boot chatter and prompts
        try:
            row = json.loads(raw)
        except json.JSONDecodeError:
            continue
        kind = row.get("type")
        if kind == "device":
            device = {"id": row.get("id", "hearth-home"), "name": row.get("name", "Home")}
        elif kind == "event":
            temp_start, temp_end = row.get("temp_start"), row.get("temp_end")
            if temp_start is None or temp_end is None or temp_start < -50 or temp_end < -50:
                continue  # probe was missing, so the temperatures are not trustworthy
            if row["end"] > row["start"]:
                events.append({
                    "start": iso(row["start"]), "end": iso(row["end"]),
                    "temp_start_f": round(temp_start, 1), "temp_end_f": round(temp_end, 1),
                })
        elif kind == "reading" and row.get("temp") is not None and row["temp"] > -50:
            readings[row["t"]] = {"t": iso(row["t"]), "temp_f": round(row["temp"], 1)}
    unique = {(e["start"], e["end"]): e for e in events}
    return device, sorted(unique.values(), key=lambda e: e["start"], reverse=True), [readings[k] for k in sorted(readings)]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("log", type=Path, help="saved serial output containing the EXPORT lines")
    parser.add_argument("--name", help="room name shown in the app (overrides the device's own)")
    parser.add_argument("--out", type=Path, default=ROOT / "data" / "frozen")
    args = parser.parse_args()
    device, events, readings = parse(args.log.read_text(errors="replace").splitlines())
    if not readings:
        print("No readings found; run EXPORT on the device and save the serial output.", file=sys.stderr)
        return 1
    if args.name:
        device = {**device, "name": args.name}
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "device_events.json").write_text(json.dumps({"device": device, "events": events}, indent=1))
    (args.out / "device_readings.json").write_text(json.dumps({"device": device, "readings": readings}, indent=1))
    print(f"Wrote {len(events)} outage events and {len(readings)} readings to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
