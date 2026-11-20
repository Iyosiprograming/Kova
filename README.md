# 🎬 KOVA

> A modern, local-first desktop streaming app for **Movies**, **TV Shows**, and **Live Sports**.

Kova gives you a clean, Netflix-inspired interface to browse trending content, track what you're watching, and stream live sports — packaged as a single Windows application or run locally in development.

---

## ✨ Features

- **Movies & TV Series**: Browse trending titles, view details, switch seasons/episodes, and stream smoothly.
- **Live Sports Hub**: Today's matches with live countdowns, league filters (Champions League, Premier League, NBA, UFC, F1), and stream links.
- **Spotlight Search (`Ctrl + K`)**: Instant search across thousands of movies and TV shows.
- **Local & Private**: Your Watchlist and Continue Watching history are saved locally on your computer in SQLite (`kova.db`).
- **No Console Clutter**: Runs silently in the background and opens right in your default browser.

---

## 📥 Download & Run (Windows)

No installation, Python, or coding required:

1. Go to the **[Releases](../../releases/latest)** page.
2. Download **`Kova.exe`** under the **Assets** section.
3. Double-click **`Kova.exe`**. It starts quietly in the background and opens Kova directly in your browser!

> 💡 **Note on Windows SmartScreen**: On the very first launch, Windows may show *"Windows protected your PC"* because the app is new and unsigned. Simply click **"More info"** ➔ **"Run anyway"**.

---

## 🛠️ Developer Setup

If you want to modify code or run the project in development mode:

### Prerequisites
- **Python 3.11+** (managed with [`uv`](https://github.com/astral-sh/uv) or `pip`)
- **Node.js 18+** & `npm`

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kova.git
cd kova
```

### 2. Start the Backend
```bash
# Install dependencies with uv (or pip)
uv sync

# Run backend development server (starts on http://127.0.0.1:8000)
uv run python run.py
```

### 3. Start the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. (API requests automatically proxy to port 8000).

---

## 📦 How to Build the `.exe`

To build the standalone Windows executable yourself:

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Package with PyInstaller:**
   ```bash
   uv run pyinstaller --noconsole --onefile --name "Kova" --icon=app.ico --add-data "dist;dist" --clean run.py
   ```

The finished executable will be in `dist/Kova.exe`.

---

## 📁 Project Structure

```text
KOVA/
├── backend/               # FastAPI backend & database
│   ├── main.py            # API routes and static file server
│   ├── db.py              # SQLite models (Watchlist, History)
│   ├── cache.py           # In-memory TTL caching
│   └── services/          # Cinemeta (VOD) and EmbedSE (Sports) APIs
├── frontend/              # React 18 + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/    # Navbar, MediaCard, VodPlayer, SportsDock
│   │   ├── pages/         # Home, Movies, Details, Watchlist, Sports
│   │   └── index.css      # Midnight charcoal theme & Tailwind styling
│   └── dist/              # Built frontend assets
├── dist/                  # Production distribution folder
│   ├── Kova.exe           # Single standalone Windows application
│   └── index.html         # Embedded SPA entry
├── app.ico                # Application icon
├── pyproject.toml         # Python dependencies
└── run.py                 # Application launcher
```

---

## 🧰 Tech Stack

- **Backend**: Python, FastAPI, Uvicorn, SQLAlchemy 2.0, HTTPX
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Packaging**: PyInstaller
- **Data Providers**: Cinemeta API (VOD catalogs & metadata), EmbedSE (Sports events)

---

## 📝 License

Distributed for educational and personal entertainment purposes.
