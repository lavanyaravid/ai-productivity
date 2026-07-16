# StudyDesk — Student Productivity Hub

A full-stack MERN application for student productivity: tasks, notes, goals, a weekly
study planner, a Pomodoro focus timer, and analytics — all in one calm, distraction-free
workspace.

**Stack:** React 19 + Vite, Tailwind CSS v4, Framer Motion, React Router, React Hook Form,
Recharts, Context API · Node.js + Express (MVC) · MongoDB + Mongoose · JWT auth with
email OTP verification · Cloudinary for image uploads.

No Next.js, no TypeScript, no Redux, no Firebase — pure MERN, as specified.

---

## 1. Project structure

```
student-productivity-hub/
├── backend/                 # Express API (MVC)
│   ├── config/               # DB + Cloudinary config
│   ├── models/                # Mongoose schemas
│   ├── controllers/           # Route handlers (business logic)
│   ├── routes/                 # Express routers
│   ├── middleware/             # auth, validation, error handling, uploads, rate limiting
│   ├── services/                # Cloudinary + achievement/badge logic + ai/ (Gemini AI Study Assistant)
│   ├── utils/                    # email sender/templates, token helpers, ApiError
│   ├── app.js / server.js
│   └── .env.example
└── frontend/                 # React (Vite) app
    └── src/
        ├── components/         # ui/, layout/, auth/ — reusable building blocks
        ├── context/              # AuthContext, ThemeContext
        ├── hooks/                 # useNotifications
        ├── pages/                  # Landing, Login, Register, Dashboard, Tasks, ...
        ├── services/                # one axios module per resource
        └── utils/images.js           # curated study-themed imagery
```

## 2. Prerequisites

- Node.js v18+ (tested with v24.16.0)
- npm v10+ (tested with v11.13.0)
- MongoDB running locally (MongoDB Compass / `mongod` on `mongodb://127.0.0.1:27017`)
- A free Cloudinary account (for avatar/note-attachment uploads)
- An SMTP account for sending OTP/reset emails (a Gmail App Password or a Mailtrap
  sandbox both work well for local dev)
- A free Google Gemini API key (for the AI Study Assistant) — generate one at
  https://aistudio.google.com/app/apikey

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in:

- `MONGO_URI` — defaults to a local DB, works out of the box with MongoDB Compass
- `JWT_SECRET` — any long random string
- `SMTP_*` — your email credentials (registration/OTP/password-reset emails)
- `CLOUDINARY_*` — from your Cloudinary dashboard
- `GEMINI_API_KEY` — powers the AI Study Assistant chat (leave the other `AI_PROVIDER`/
  `GEMINI_MODEL` values at their defaults unless you know you want to change them)

Start the API:

```bash
npm run dev        # nodemon, http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

## 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev             # http://localhost:5173
```

## 5. First run walkthrough

1. Open `http://localhost:5173` → Landing page.
2. Click **Get started free** → Register with first/last name, email, password.
3. Check the inbox tied to your SMTP account for a 6-digit OTP → enter it on
   the Verify screen (auto-logs you in once verified).
4. You land on the Dashboard. Try:
   - **Tasks** → create/edit/complete/delete, filter by status & priority
   - **Notes** → colored sticky notes, pin/archive/search
   - **Goals** → milestones with an animated progress ring
   - **Study Planner** → build a weekly block schedule per subject
   - **Focus Timer** → Pomodoro work/break cycles, logged to your streak
   - **Analytics** → weekly charts, subject breakdown, task distribution
   - **Calendar** → month view of task due dates
   - **Profile** → avatar upload (Cloudinary), dark/light mode, change password

## 6. Notable implementation details

- **Auth**: JWT in an httpOnly cookie *and* returned in the JSON body (also cached in
  `localStorage`) so the SPA can attach `Authorization: Bearer <token>` headers.
- **OTP verification**: 6-digit code, hashed + expiring server-side; login blocks
  unverified accounts and auto-resends a fresh OTP.
- **Achievements**: a small badge engine (`services/achievementService.js`) awards
  badges for task/streak/pomodoro milestones and pushes an in-app notification.
- **Design system**: custom Tailwind v4 `@theme` tokens (see `frontend/src/index.css`) —
  a warm "desk lamp at night" palette (ink/amber/violet) instead of default indigo,
  with a reusable `ProgressRing` component used for the Pomodoro timer, goal progress,
  and dashboard stats.
- **Images**: curated Unsplash study/desk photography via `frontend/src/utils/images.js`,
  used on the landing page and split-screen auth backgrounds.

## 7. Production notes

- Set `NODE_ENV=production` in `backend/.env` for secure cookies.
- Build the frontend with `npm run build` in `frontend/` (outputs to `frontend/dist`).
- CORS is restricted to `CLIENT_URL` in `backend/.env` — update it to your deployed
  frontend origin.
