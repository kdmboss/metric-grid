"""A separate room-test utility must not alter optimization inputs."""
import importlib.util
from pathlib import Path
import subprocess
import sys
import pytest
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('cooling_from_log', ROOT / 'scripts/cooling_from_log.py')
cooling = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cooling)


def test_linear_cooling_fixture():
    data = cooling.analyze('6:00 PM | 70.0 F\n7:00 PM | 68.0 F\n8:00 PM | 66.0 F',
                           '2026-10-20', '6:00 PM', '8:00 PM', True)
    assert data['cooling_rate_f_per_hour'] == pytest.approx(2)
    assert data['hours_to_64f'] == pytest.approx(3)
    assert data['r_squared'] == pytest.approx(1)
    assert data['start_temp_f'] == 70
    assert data['is_demo'] is True


@pytest.mark.parametrize('end', [70, 72])
def test_flat_or_warming_has_no_estimated_crossing(end):
    data = cooling.analyze(f'6:00 PM | 70.0 F\n7:00 PM | {end} F', '2026-10-20', '6:00 PM', '7:00 PM')
    assert data['hours_to_64f'] is None


def test_midnight_window_and_insufficient_readings():
    data = cooling.analyze('11:00 PM | 70.0 F\n12:00 AM | 68.0 F', '2026-10-20', '11:00 PM', '12:00 AM')
    assert data['cooling_rate_f_per_hour'] == pytest.approx(2)
    with pytest.raises(ValueError):
        cooling.analyze('6:00 PM | 70.0 F', '2026-10-20', '6:00 PM', '8:00 PM')


def test_demo_cannot_write_runtime_data():
    target = ROOT / 'data/frozen/node_cooling.json'
    before = target.read_bytes() if target.exists() else None
    run = subprocess.run([sys.executable, str(ROOT / 'scripts/cooling_from_log.py'), '--demo',
                          '--date', '2026-10-20', '--start', '6:00 PM', '--end', '8:00 PM',
                          '--output', str(ROOT / 'data/frozen/node_cooling.json')], capture_output=True)
    assert run.returncode != 0
    assert (target.read_bytes() if target.exists() else None) == before
