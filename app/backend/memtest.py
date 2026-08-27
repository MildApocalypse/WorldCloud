import subprocess
import sys
import time

import psutil


def get_total_rss(process: psutil.Process) -> tuple[int, int]:
    try:
        total = process.memory_info().rss
    except psutil.NoSuchProcess:
        return 0, 0

    children = process.children(recursive=True)
    for child in children:
        try:
            total += child.memory_info().rss
        except psutil.NoSuchProcess:
            continue

    return total, 1 + len(children)


def measure_peak_memory(command: list[str]) -> None:
    start_time = time.monotonic()
    process = subprocess.Popen(command)
    ps_process = psutil.Process(process.pid)

    peak_rss_bytes = 0
    peak_process_count = 1

    while process.poll() is None:
        total_rss, process_count = get_total_rss(ps_process)
        if total_rss > peak_rss_bytes:
            peak_rss_bytes = total_rss
            peak_process_count = process_count
        time.sleep(0.2)

    elapsed = time.monotonic() - start_time
    peak_mb = peak_rss_bytes / (1024 ** 2)

    print(f"\nExit code: {process.returncode}")
    print(f"Elapsed time: {elapsed:.1f}s")
    print(f"Peak process count (parent + children): {peak_process_count}")
    print(f"Peak memory usage: {peak_mb:.0f} MB ({peak_mb / 1024:.2f} GB)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python measure_memory.py <your_script.py> [args...]")
        sys.exit(1)

    measure_peak_memory([sys.executable] + sys.argv[1:])