"""Fit a heat-off, power-on room cooling test; never feed it into planning results."""
from __future__ import annotations
import argparse
from datetime import date, datetime, timedelta
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PATTERN = re.compile(r'^\s*(\d{1,2}:\d{2}\s*[AP]M)\s*\|\s*(-?\d+(?:\.\d+)?)\s*F\s*$', re.I)


def clock(value: str):
    """Parse the serial display's 12-hour time."""
    return datetime.strptime(value.strip().upper(), '%I:%M %p').time()


def analyze(text: str, day: str, start: str, end: str, demo: bool = False) -> dict:
    """Fit least squares to observed readings inside an inclusive heat-off window."""
    day_value = date.fromisoformat(day)
    begin = datetime.combine(day_value, clock(start))
    finish = datetime.combine(day_value, clock(end))
    if finish <= begin:
        finish += timedelta(days=1)
    readings = []
    for number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        match = PATTERN.fullmatch(line)
        if not match:
            raise ValueError(f'Invalid serial reading on line {number}')
        timestamp = datetime.combine(day_value, clock(match[1]))
        if finish.date() > begin.date() and timestamp < begin:
            timestamp += timedelta(days=1)
        if begin <= timestamp <= finish:
            readings.append({'time': timestamp.isoformat(), 'temp_f': float(match[2])})
    readings.sort(key=lambda row: row['time'])
    if len(readings) < 2:
        raise ValueError('At least two readings at different times are required in the window')
    origin = datetime.fromisoformat(readings[0]['time'])
    xs = [(datetime.fromisoformat(r['time']) - origin).total_seconds() / 3600 for r in readings]
    ys = [r['temp_f'] for r in readings]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    variance = sum((x - mx) ** 2 for x in xs)
    if variance == 0:
        raise ValueError('Readings must span different times')
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / variance
    intercept = my - slope * mx
    residual = sum((y - (intercept + slope * x)) ** 2 for x, y in zip(xs, ys))
    total = sum((y - my) ** 2 for y in ys)
    rate = -slope
    return {'schema_version': 1, 'is_demo': demo, 'date': day,
            'conditions': 'heat off, power on, one room, one home',
            'window_start': begin.isoformat(), 'window_end': finish.isoformat(),
            'readings': readings, 'start_temp_f': ys[0], 'cooling_rate_f_per_hour': rate,
            'r_squared': 1 - residual / total if total else 1.0,
            'hours_to_64f': max(0, (ys[0] - 64) / rate) if rate > 0 else None,
            'reference_temp_f': 64, 'hours_origin': readings[0]['time']}


def main():
    """Write real measurements, or an explicitly marked temporary test fixture."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--log', type=Path, default=ROOT / 'data/raw/cooling_log.txt')
    parser.add_argument('--date', required=True)
    parser.add_argument('--start', required=True)
    parser.add_argument('--end', required=True)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--demo', action='store_true', help='Tests only; never writes runtime data')
    args = parser.parse_args()
    if args.demo:
        text = '6:00 PM | 70.0 F\n6:30 PM | 69.0 F\n7:00 PM | 68.0 F\n7:30 PM | 67.0 F\n8:00 PM | 66.0 F'
        if args.output and any(args.output.resolve().is_relative_to(ROOT / name)
                               for name in ('data', 'public', 'dist', 'web')):
            parser.error('Demo fixtures cannot be written into application/runtime data directories')
    else:
        text = args.log.read_text()
    result = analyze(text, args.date, args.start, args.end, args.demo)
    serialized = json.dumps(result, indent=2, allow_nan=False) + '\n'
    output = args.output or (None if args.demo else ROOT / 'data/frozen/node_cooling.json')
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(serialized)
        print(f'Wrote {len(result["readings"])} readings to {output}')
    else:
        print(serialized, end='')


if __name__ == '__main__':
    main()
