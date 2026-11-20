import os
import sys
from pathlib import Path

# When running under PyInstaller with --noconsole, redirect stdout/stderr to avoid NoneType errors
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

# Ensure root and backend modules are resolvable
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.run import main

if __name__ == "__main__":
    main()
