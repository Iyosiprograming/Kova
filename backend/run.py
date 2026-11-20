import os
import sys
import time
import socket
import threading
import webbrowser
from pathlib import Path

# Add project root and backend dir to sys.path
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from backend.main import app


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a specific port is already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        try:
            s.bind((host, port))
            return False
        except OSError:
            return True


def find_free_port(start_port: int = 8000, max_attempts: int = 50, host: str = "127.0.0.1") -> int:
    """Find the first available port starting from start_port (default: 8000)."""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port, host):
            return port
    # Fallback to system-allocated ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, 0))
        return s.getsockname()[1]


def open_browser_delayed(url: str, delay: float = 1.2):
    """Wait for server to bind and open default web browser."""
    def _open():
        time.sleep(delay)
        print(f"Opening browser at: {url}")
        webbrowser.open(url)
    
    thread = threading.Thread(target=_open, daemon=True)
    thread.start()


def main():
    host = "127.0.0.1"
    preferred_port = int(os.environ.get("PORT", "8000"))
    if not is_port_in_use(preferred_port, host):
        port = preferred_port
    else:
        port = find_free_port(start_port=preferred_port, host=host)
    url = f"http://{host}:{port}"

    print("=" * 55)
    print("   KOVA - Desktop Streaming Application")
    print(f"   Server running at: {url}")
    print("=" * 55)

    # Launch browser after 1.2 seconds
    open_browser_delayed(url, delay=1.2)

    # Start Uvicorn ASGI server
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=False,
    )


if __name__ == "__main__":
    main()
