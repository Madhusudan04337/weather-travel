# 🌤️ Weather Travel

> **A weather-aware travel planning platform.**  
> Plan trips smarter by understanding weather conditions at your destination before and during your journey.

---

## Project Structure

```
weather-travel/
├── backend/           # FastAPI + Motor (async MongoDB)
│   ├── app/
│   │   ├── api/       # Route handlers (v1/…)
│   │   ├── core/      # Config, database connection
│   │   ├── middleware/ # Logging, auth middleware
│   │   ├── models/    # Domain models (plain dataclasses / Pydantic)
│   │   ├── repositories/ # MongoDB collection access layer
│   │   ├── schemas/   # Request / response Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── tests/     # pytest-asyncio tests
│   │   └── utils/     # Shared helpers
│   ├── .env.example
│   ├── pyproject.toml
│   └── requirements.txt
│
└── frontend/          # React 19 + Vite 6 + Tailwind CSS v4
    ├── src/
    │   ├── assets/    # Static assets (images, icons, fonts)
    │   ├── components/ # Reusable UI components
    │   ├── contexts/  # React Contexts (auth, theme, …)
    │   ├── hooks/     # Custom React hooks
    │   ├── layouts/   # Page layout wrappers
    │   ├── pages/     # Route-level page components
    │   ├── routes/    # React Router v6 config
    │   └── services/  # API service modules (fetch wrappers)
    ├── .env.example
    └── vite.config.ts
```

---

## Phase 1 — Foundation

| Area | Technology |
|------|-----------|
| Backend framework | FastAPI 0.111 |
| Async MongoDB driver | Motor 3.4 (no Beanie ODM) |
| Auth | JWT via `python-jose` + `passlib` |
| Frontend framework | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Routing | React Router v6 |

---

## Prerequisites

| Tool | Min. version |
|------|-------------|
| Python | 3.11+ |
| Node.js | 20+ |
| MongoDB | 6.0+ (local or Atlas) |

---

## Backend Setup

```bash
cd backend

# 1. Create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env               # then edit .env with your values

# 4. Run the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **Swagger UI** → http://localhost:8000/docs  
- **ReDoc** → http://localhost:8000/redoc  
- **Health check** → http://localhost:8000/api/v1/health

### Backend Tests

```bash
cd backend
pytest
```

---

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env               # then edit VITE_API_URL if needed

# 3. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.  
The Vite dev server proxies `/api/*` requests to the FastAPI backend automatically.

---

## Environment Variables

### `backend/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `weather_travel` |
| `JWT_SECRET` | Secret key for JWT signing | _(must change)_ |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL in minutes | `1440` (24 h) |
| `DEBUG` | Enable debug mode | `False` |
| `ALLOWED_ORIGINS` | JSON array of allowed CORS origins | `["http://localhost:5173"]` |

### `frontend/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:8000/api/v1` |

---

## API Endpoints (Phase 1)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Service health check |

---

## Development Workflow

1. Start MongoDB locally (or point `MONGO_URI` to Atlas).
2. Run the FastAPI backend (`uvicorn app.main:app --reload`).
3. Run the Vite dev server (`npm run dev` in `frontend/`).
4. Open http://localhost:5173 in your browser.

---

## Roadmap

- **Phase 2** — User authentication (register, login, JWT refresh)
- **Phase 3** — Destination search & weather data integration
- **Phase 4** — Trip planning (itinerary builder, weather timeline)
- **Phase 5** — Notifications & alerts
