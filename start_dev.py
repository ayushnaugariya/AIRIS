"""
AIRIS Unified Development Orchestrator.
Spawns FastAPI Backend (port 8000) and Next.js Frontend (port 3000) concurrently.

Usage:
    python start_dev.py
"""
import os
import sys
import subprocess
import signal
import time

def find_python():
    if os.path.exists(os.path.join(".venv", "Scripts", "python.exe")):
        return os.path.join(".venv", "Scripts", "python.exe")
    return sys.executable

def main():
    py_exec = find_python()
    print("=" * 60)
    print(">> Starting AIRIS Full-Stack System (Frontend + Backend + Scraper)")
    print(f"   Python Executable: {py_exec}")
    print("   Backend API:       http://localhost:8000 (Docs: /docs)")
    print("   WebSocket Stream:  ws://localhost:8000/ws/live")
    print("   Next.js Frontend:  http://localhost:3000")
    print("=" * 60)

    # 1. Start FastAPI Backend
    backend_cmd = [py_exec, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd)

    # 2. Start Next.js Frontend
    npm_cmd = "npm.cmd run dev" if os.name == "nt" else "npm run dev"
    frontend_proc = subprocess.Popen(npm_cmd, shell=True)

    print("\n[OK] Both services spawned. Press Ctrl+C to terminate all services.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n>> Shutting down AIRIS services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print(">> All processes stopped cleanly.")

if __name__ == "__main__":
    main()
