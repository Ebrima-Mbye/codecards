# CodeCards

A full-stack flashcard and quiz app for learning code syntax. Cards can render as plain text or as formatted code blocks, letting you build decks like "JavaScript array methods" or "Python list comprehensions" with snippets, not just text.

## Status

🚧 In development — solo build, 12-day timeline.

## Tech Stack

- **Backend:** Express.js, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** Vanilla HTML/CSS/JS, Fetch API
- **Hosting (planned):** Render/Railway (backend), Netlify/Vercel (frontend)

## Features

- [ ] User registration & login (JWT)
- [ ] Deck CRUD, organized by language
- [ ] Card CRUD, with `text` and `code` card types
- [ ] Quiz mode with flip-card UI and scoring
- [ ] Score history per deck
- [ ] Responsive design, no CSS frameworks

## Project Structure

```
codecards/
├── backend/
│   ├── models/         # User, Deck, Card, Score (Mongoose schemas)
│   ├── routes/         # Express route definitions
│   ├── controllers/    # Route handler logic
│   ├── middlewares/    # Auth middleware, error handler
│   ├── utils/          # Logger, helpers
│   ├── db.js           # MongoDB connection
│   ├── index.js        # Express app config
│   └── server.js       # Entry point
├── frontend/
│   ├── pages/           # login.html, register.html, dashboard.html, deck.html, quiz.html
│   ├── js/               # Per-page JS modules
│   ├── css/              # style.css (custom properties, reset, components)
│   └── index.html        # Landing page
└── .gitignore
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your MongoDB URI and JWT secret
npm run dev
```

### Frontend

Open `frontend/index.html` directly, or serve it with a simple static server (e.g. VS Code Live Server).

## Environment Variables

See `backend/.env.example` for required variables:

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `NODE_ENV` | `development` or `production` |

## API Endpoints

_To be documented as routes are built (Day 6 per workplan)._

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in, receive JWT | No |

## Data Models

See `PROJECT_PROPOSAL.docx` for full schema details (User, Deck, Card, Score).

## License

Educational project — no license specified yet.
