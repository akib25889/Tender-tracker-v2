#!/usr/bin/env python3
"""
TenderTracker Command Center — Unified Verification Runner
==========================================================
Runs four verification gates in sequence:
  1. Database health check (SQLite dev mode)
  2. Backend pytest suite (25 tests across 3 modules)
  3. Frontend TypeScript type-check  (tsc -b)
  4. Knowledge graph sync verification (graphify.py)

Usage:
    python run_all_tests.py

Exit codes:
    0  All gates pass
    1  One or more gates failed (details printed)
"""

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent

# ANSI colours
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def banner(text: str) -> None:
    bar = "─" * 60
    print(f"\n{CYAN}{BOLD}{bar}{RESET}")
    print(f"{CYAN}{BOLD}  {text}{RESET}")
    print(f"{CYAN}{BOLD}{bar}{RESET}")


def ok(label: str, detail: str = "") -> None:
    suffix = f"  {YELLOW}{detail}{RESET}" if detail else ""
    print(f"  {GREEN}✓  PASS{RESET}  {label}{suffix}")


def fail(label: str, detail: str = "") -> None:
    suffix = f"\n{RED}{detail}{RESET}" if detail else ""
    print(f"  {RED}✗  FAIL{RESET}  {label}{suffix}")


def run(cmd: list[str], cwd: Path | None = None, env_extra: dict | None = None):
    """Run a subprocess and return (returncode, combined_output)."""
    import os

    env = os.environ.copy()
    if env_extra:
        env.update(env_extra)
    result = subprocess.run(
        cmd,
        cwd=str(cwd or ROOT),
        capture_output=True,
        text=True,
        env=env,
    )
    return result.returncode, result.stdout + result.stderr


# ─── Gate 1: Database Health ──────────────────────────────────────────────────
def gate_db_health() -> bool:
    banner("Gate 1 / 4 — Database Health Check")
    script = """
import sys
sys.path.insert(0, 'backend')
from app.core.database import engine, Base
import app.models  # register all models
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
print('OK')
"""
    rc, out = run([sys.executable, "-c", script])
    if rc == 0 and "OK" in out:
        ok("SQLite engine responds to SELECT 1")
        return True
    fail("Database health check", out.strip())
    return False


# ─── Gate 2: Pytest Suite ─────────────────────────────────────────────────────
def gate_pytest() -> bool:
    banner("Gate 2 / 4 — Backend Pytest Suite")
    python_exe = ROOT / "backend" / "venv" / "Scripts" / "python.exe"
    if not python_exe.exists():
        python_exe = Path(sys.executable)

    rc, out = run(
        [str(python_exe), "-m", "pytest", "-v", "backend/tests"],
        env_extra={"PYTHONPATH": "backend"},
    )
    # Print last 20 lines of pytest output
    lines = out.strip().splitlines()
    for line in lines[-20:]:
        print(f"    {line}")

    if rc == 0:
        # Extract summary line
        summary = next((l for l in reversed(lines) if "passed" in l), "")
        ok("All pytest tests passed", summary.strip())
        return True
    fail("Pytest suite", "See output above")
    return False


# ─── Gate 3: TypeScript Type Check ───────────────────────────────────────────
def gate_typescript() -> bool:
    banner("Gate 3 / 4 — Frontend TypeScript Type Check")
    rc, out = run(["npx", "tsc", "-b", "--noEmit"], cwd=ROOT / "frontend")
    if rc == 0:
        ok("TypeScript: zero type errors")
        return True
    lines = out.strip().splitlines()
    for line in lines[:30]:
        print(f"    {line}")
    fail("TypeScript type errors detected", f"({len(lines)} lines)")
    return False


# ─── Gate 4: Knowledge Graph Sync ────────────────────────────────────────────
def gate_knowledge_graph() -> bool:
    banner("Gate 4 / 4 — Knowledge Graph Sync Verification")
    graph_py = ROOT / "tools" / "graphify" / "graphify.py"
    graph_md = ROOT / "tools" / "graphify" / "knowledge_graph.md"
    graph_json = ROOT / "tools" / "graphify" / "knowledge_graph.json"

    if not graph_py.exists():
        fail("graphify.py not found", str(graph_py))
        return False

    mtime_before = graph_json.stat().st_mtime if graph_json.exists() else 0
    rc, out = run([sys.executable, str(graph_py)])
    if rc != 0:
        fail("graphify.py exited with error", out.strip())
        return False

    mtime_after = graph_json.stat().st_mtime if graph_json.exists() else 0
    if not graph_md.exists() or not graph_json.exists():
        fail("Knowledge graph output files missing after graphify run")
        return False

    status = (
        "regenerated"
        if mtime_after > mtime_before
        else "unchanged (already up-to-date)"
    )
    ok(f"knowledge_graph.md & .json are in sync", status)
    return True


# ─── Main ─────────────────────────────────────────────────────────────────────
def main() -> int:
    print(f"\n{BOLD}TenderTracker Command Center — Unified Verification Runner{RESET}")
    print(f"Root: {ROOT}\n")
    t0 = time.monotonic()

    gates = [gate_db_health, gate_pytest, gate_typescript, gate_knowledge_graph]
    results: list[bool] = []
    for gate in gates:
        try:
            results.append(gate())
        except Exception as exc:
            fail(gate.__name__, str(exc))
            results.append(False)

    elapsed = time.monotonic() - t0
    bar = "─" * 60
    print(f"\n{BOLD}{bar}{RESET}")
    passed = sum(results)
    total = len(results)
    color = GREEN if passed == total else RED
    print(
        f"{color}{BOLD}  Result: {passed}/{total} gates passed  ({elapsed:.1f}s){RESET}"
    )
    print(f"{BOLD}{bar}{RESET}\n")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
