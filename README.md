# CampusConnect

A student communication platform for IUT: announcements, club/society management, blood donation requests, lost & found, room booking, marketplace, and admin tooling.

## Tech Stack

- **Frontend**: React 19 + Vite, React Router, Axios, Firebase Auth
- **Backend**: Node.js + Express, MongoDB (Mongoose), JWT auth, Firebase Admin, Nodemailer
- **Testing**: Jest (both frontend and backend)

## Project Structure

```
Backend/    # Express API (MongoDB via Mongoose), port 4000
frontend/   # React app (Vite), port 5173 in dev
```

## Local Development

### Backend
```bash
cd Backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
npm run dev
```
Also requires a `firebase.admin.json` service account file in `Backend/` (gitignored, not included in the repo).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd Backend && npm test
cd frontend && npm test
```

## Running with Docker

```bash
docker compose up --build
```

This builds and runs:
- **backend** — Express API on `http://localhost:4000`, using `Backend/.env` and a read-only mount of `Backend/firebase.admin.json` (both must exist locally; neither is baked into the image)
- **frontend** — static build served by Nginx on `http://localhost:80`

No local database container is included — the app connects to an external MongoDB Atlas instance via `MONGO_URI`.

> Note: most frontend API calls currently use an absolute `http://localhost:4000` base URL rather than a relative path, so they work against the backend's published port directly rather than through Nginx's `/api` proxy. This only works for local/localhost deployments.

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`:
- Backend and frontend test suites (`npm test`)
- A Docker build check for both images (no push to any registry)
