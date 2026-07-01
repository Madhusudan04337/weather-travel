# Weather Travel Planner

A full-stack application for planning trips with weather-aware recommendations.

## Tech Stack
- **Backend:** FastAPI, MongoDB (Motor), Pydantic v2
- **Frontend:** React, Vite, Tailwind CSS v4, React Hook Form, Zod, React Query

## Setup & Running

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB

### Environment Variables
Copy `.env.example` to `.env` in both `frontend` and `backend` directories and update the values.

**Backend (`backend/.env`):**
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=weather_travel
```

**Frontend (`frontend/.env`):**
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Run Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs)

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173)
