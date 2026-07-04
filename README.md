# Weather Travel Planner

## 1. Project Overview
A weather-aware travel planning application that streamlines the process of requesting travel, securing manager approvals, and executing fulfillment tasks. By integrating real-time weather forecasts, the system generates intelligent travel recommendations to ensure employee safety and comfort.

### Features
- **Intelligent City Autocomplete:** Fast destination searching powered by Open-Meteo geocoding.
- **Automated Weather Integration:** Fetches real-time forecasts based on destination and travel dates.
- **Smart Recommendations:** Automatically evaluates weather conditions and generates risk-based recommendations.
- **Dynamic Approval Workflow:** Automatically routes "High" budget requests to an Approval Queue. 
- **Fulfillment Task Tracking:** Auto-generates fulfillment checklists for travel teams upon approval.

### Tech Stack
- **Frontend:** React, TypeScript, Vite, React Query, Zod.
- **Backend:** FastAPI, Python, Motor (Async MongoDB).
- **Database:** MongoDB.
- **External APIs:** Open-Meteo API (Forecast & Geocoding).

## 2. System Architecture

![Architecture](assets/architecture.png)

## 3. Workflow Diagram

![Workflow](assets/workflow.png)

## 4. Application Screenshots

### Dashboard
![Dashboard](assets/screenshots/dashboard.png)

---

### Create Travel Request
![Create Request](assets/screenshots/create-request.png)

---

### Request Details (with Weather & Recommendation)
![Request Details](assets/screenshots/request-details.png)

---

### Approval Queue
![Approval Queue](assets/screenshots/approval-queue.png)

---

### Fulfillment Tasks
![Fulfillment Tasks](assets/screenshots/fulfillment-tasks.png)

---

### Closed Request
![Closed Request](assets/screenshots/closed-request.png)

## 5. API Documentation

- `GET /api/v1/requests` - List travel requests.
- `POST /api/v1/requests` - Create a new request.
- `GET /api/v1/requests/{id}` - Retrieve request details.
- `PATCH /api/v1/requests/{id}` - Update a pending request.
- `DELETE /api/v1/requests/{id}` - Delete a pending request.
- `POST /api/v1/requests/{id}/approve` - Approve a request.
- `POST /api/v1/requests/{id}/reject` - Reject a request.
- `POST /api/v1/requests/{id}/tasks` - Auto-create fulfillment tasks.
- `PATCH /api/v1/requests/{id}/tasks/{task_id}/complete` - Complete a task.
- `GET /api/v1/cities/search?q={query}` - Fetch city autocomplete suggestions.

*Detailed Swagger UI documentation is available automatically at `/docs` when running the backend.*

## 6. Installation

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv .venv`
3. Activate the virtual environment:
   - Linux/Mac: `source .venv/bin/activate`
   - Windows: `.venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Configure your `.env` file with your `MONGO_URI`.
6. Run the server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## 7. Future Enhancements
- **Authentication & Authorization:** Secure routes using JWTs and Role-Based Access Control (RBAC).
- **Email Integration:** Send real notification emails for approvals and task completions instead of logging them.
- **AI Integration (Gemini):** Use advanced AI models to generate highly personalized travel insights and full itineraries.
- **Offline Support:** Implement PWA features for viewing itineraries offline.
