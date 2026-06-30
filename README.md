# SmartCampus Navigator 🗺️

An AI-powered campus navigation and crowd intelligence web app built for Delhi Technological University (DTU). It combines real-time geospatial tracking, graph-based pathfinding, and deep learning to solve a problem every large campus faces — students don't know where the crowd is, where to walk, or when the bus arrives.

**Backend API:** `[]`  
**ML API:** `[]`  

---

## The problem

DTU's 164-acre campus has no intelligent navigation system. Students rely on guesswork to figure out which canteen has the shortest wait, which route to a lab is fastest, and when the next shuttle arrives. Existing tools like Google Maps don't model campus-specific data — crowd density, internal walking paths, or live transit.

## The solution

SmartCampus Navigator gives students a live, interactive map of campus with three core capabilities: optimal routing between any two points, real-time crowd visibility across canteens, labs, and bus stops, and ML-based predictions for crowd levels an hour into the future.

---

## Features

- **Interactive campus map** — built on Leaflet.js with custom markers for canteens, labs, libraries, hostels, gates, and bus stops
- **A\* pathfinding** — a custom-built shortest-path algorithm that treats campus locations as a weighted graph, using the Haversine formula for real-world distance heuristics
- **Real-time crowd tracking** — Socket.io pushes live crowd updates to every connected client every 10 seconds, with markers color-coded green/amber/red by density
- **LSTM crowd forecasting** — a Keras-trained sequence model predicts crowd levels one hour ahead per location, served through a dedicated FastAPI microservice
- **Live bus ETA** — simulated shuttle tracking with real-time updates pushed via WebSockets
- **Admin dashboard** — broadcast campus-wide alerts (e.g. "Main Canteen overcrowded") that appear as live toast notifications on every connected device
- **JWT authentication** — secure, cookie-based auth with role-based access control (student / admin)
- **Search** — instant location search with map auto-navigation
- **Mobile responsive** — adapts to small viewports with a bottom-sheet sidebar pattern

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Leaflet.js, Axios |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT, httpOnly cookies, bcrypt |
| ML | Python, TensorFlow/Keras (LSTM), scikit-learn |
| ML serving | FastAPI, Uvicorn |
| Deployment | Render (backend + ML), Vercel (frontend) |

---

## Architecture

```
┌─────────────┐     HTTP/WebSocket      ┌──────────────────┐
│   React     │ ◄─────────────────────► │  Node + Express   │
│  (Vite)     │                         │   + Socket.io      │
└─────────────┘                         └─────────┬─────────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │               │               │
                              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐
                              │  MongoDB   │  │   FastAPI    │  │  A* Engine │
                              │   Atlas    │  │ (LSTM model) │  │ (in-memory)│
                              └────────────┘  └──────┬───────┘  └────────────┘
                                                      │
                                              ┌───────▼────────┐
                                              │ Python Simulator │
                                              │ (crowd data gen)  │
                                              └────────────────┘
```

The ML inference layer is intentionally decoupled from the main application server — FastAPI runs as an independent microservice that Node.js calls over HTTP. This mirrors how production systems separate compute-heavy ML workloads from request-handling application logic, and means the model can be retrained, scaled, or swapped without touching the Node backend.

---

## How A* routing works

Each campus location is a node in a graph; `connectedTo` references in the database define edges. The algorithm computes the shortest walking path between two points using:

- **G cost** — actual walking distance from the start node, computed via the Haversine formula (great-circle distance between lat/lng coordinates)
- **H cost** — straight-line distance from the current node to the destination (the heuristic)
- **F cost** — G + H, which the algorithm minimizes at each step

This is the same algorithm used in game pathfinding and robotics navigation, applied here to real campus geography.

## How the LSTM model works

The model is trained on 30 days of simulated hourly crowd data across all 15 campus locations (10,800 rows), with `hour`, `day_of_week`, and `location` as input features. It uses a 24-timestep sequence (one day's worth of hourly readings) to predict the crowd level for the next hour. The architecture is a two-layer LSTM (64 → 32 units) with dropout regularization, followed by dense layers, trained with the Adam optimizer on mean squared error loss.

---

## Project structure

```
smartcampus-navigator/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Login, Register, Dashboard, Admin
│   │   ├── components/   # Map, Sidebar, BusETA, AlertToast, etc.
│   │   ├── context/       # Auth context
│   │   └── utils/         # Socket.io client setup
├── server/               # Node + Express backend
│   ├── controllers/       # Auth, location, route, crowd, predict
│   ├── models/             # User, Location, CrowdData (Mongoose)
│   ├── routes/              # API route definitions
│   ├── middleware/           # JWT auth middleware
│   ├── utils/                  # A* algorithm implementation
│   └── seed.js                 # DTU location seed data
└── ml/                   # Python ML service
    ├── generate_data.py   # Synthetic training data generator
    ├── train.py             # LSTM model training script
    ├── api.py                # FastAPI prediction server
    └── simulator.py           # Live crowd data simulator
```

---

## Running locally

You'll need four terminals running simultaneously.

**1. Backend server**
```bash
cd server
npm install
npm run dev
```

**2. Frontend**
```bash
cd client
npm install
npm run dev
```

**3. ML prediction API**
```bash
cd ml
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

**4. Crowd data simulator**
```bash
cd ml
python simulator.py
```

You'll also need a `.env` file in `server/` with `MONGO_URI`, `JWT_SECRET`, and `PORT`, and seed data loaded via `node seed.js` before first run.

---

## What I'd build next

Real GPS-based crowd sensing instead of simulation, push notifications for crowd alerts, a recommendation engine for least-crowded study spots, and integration with DTU's actual class timetable to improve prediction accuracy.

---

Built as a placement project for DTU CSE campus placements — combining full-stack development, real-time systems, and applied machine learning in one deployable product.
