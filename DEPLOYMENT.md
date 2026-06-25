# CodeCards — Deployment Guide

> A step-by-step guide for deploying CodeCards (Node.js + MongoDB Atlas backend, static HTML/CSS/JS frontend) from a fresh machine to a live URL.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install Dependencies](#2-clone--install-dependencies)
3. [MongoDB Atlas Setup](#3-mongodb-atlas-setup)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Run Locally](#5-run-locally)
6. [Deploy the Backend — Render (free)](#6-deploy-the-backend--render-free)
7. [Deploy the Frontend — Netlify (free)](#7-deploy-the-frontend--netlify-free)
8. [Update CORS for Production](#8-update-cors-for-production)
9. [Alternative Deployment Targets](#9-alternative-deployment-targets)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Production Checklist](#11-production-checklist)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

| Tool      | Minimum Version         | Check           |
| --------- | ----------------------- | --------------- |
| Node.js   | 18 LTS                  | `node -v`       |
| npm       | 9                       | `npm -v`        |
| Git       | any recent              | `git --version` |
| A browser | Chrome / Firefox / Edge | —               |

You also need free accounts on:

- [MongoDB Atlas](https://cloud.mongodb.com) — database
- [Render](https://render.com) — backend hosting
- [Netlify](https://netlify.com) — frontend hosting
- [GitHub](https://github.com) — source control (required by Render)

---

## 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/<your-username>/codecards.git
cd codecards

# Install backend dependencies only (frontend has none)
cd backend
npm install
```

Verify the install completed without errors:

```bash
ls node_modules   # should list many folders
```

---

## 3. MongoDB Atlas Setup

### 3.1 Create a Free Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign in.
2. Click **"Build a Database"** → choose **M0 Free** tier.
3. Select a cloud provider and region closest to your users.
4. Name your cluster (e.g. `cluster0`) and click **Create**.

### 3.2 Create a Database User

1. In the left sidebar click **Database Access** → **Add New Database User**.
2. Choose **Password** authentication.
3. Enter a username and a **strong** password (no `@` or `:` characters — they break the URI).
4. Under **Built-in Role** select **Atlas admin** (or `readWriteAnyDatabase`).
5. Click **Add User**.

### 3.3 Whitelist Your IP

1. In the left sidebar click **Network Access** → **Add IP Address**.
2. For development click **Add Current IP Address**.
3. For production (Render) use **Allow Access from Anywhere** (`0.0.0.0/0`).
   > Render uses dynamic IPs, so a wildcard is necessary unless you upgrade to a paid plan with static IPs.
4. Click **Confirm**.

### 3.4 Get the Connection String

1. Click **Database** in the sidebar → **Connect** on your cluster.
2. Choose **Connect your application** → Driver: **Node.js** → Version: **5.5 or later**.
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials.
5. Append `codecards` as the database name (optional — Mongoose creates it automatically):
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/codecards?retryWrites=true&w=majority
   ```

---

## 4. Configure Environment Variables

Inside the `backend/` folder create (or edit) the file named `.env`:

```dotenv
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas — paste your full URI here
MONGODB_URI="mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/codecards?retryWrites=true&w=majority"

# JWT — replace with a long random secret (32+ characters)
JWT_SECRET=replace_me_with_a_very_long_random_string_abc123xyz
JWT_EXPIRES_IN=7d
```

> **Never** commit `.env` to version control. The repo's `.gitignore` should already exclude it.

Generate a secure `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 5. Run Locally

### Start the backend

```bash
# From the backend/ folder
npm run dev      # uses nodemon (auto-restart on file changes)
# or
npm start        # plain node, no auto-restart
```

Expected output:

```
MongoDB connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

Health check — open in your browser or run:

```bash
curl http://localhost:5000/api/health
# {"status":"ok","message":"CodeCards API is running"}
```

### Open the frontend

No build step needed. Simply open `frontend/index.html` in your browser:

```bash
# macOS
open frontend/index.html

# Windows (from project root)
start frontend/index.html

# Or use VS Code Live Server extension
```

The frontend's `js/api.js` already points to `http://localhost:5000/api` for local development.

---

## 6. Deploy the Backend — Render (free)

### 6.1 Push to GitHub

```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### 6.2 Create a Render Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub account and select the `codecards` repository.
3. Configure the service:

   | Setting            | Value                 |
   | ------------------ | --------------------- |
   | **Name**           | `codecards-api`       |
   | **Region**         | Closest to your users |
   | **Branch**         | `main`                |
   | **Root Directory** | `backend`             |
   | **Runtime**        | `Node`                |
   | **Build Command**  | `npm install`         |
   | **Start Command**  | `node server.js`      |
   | **Instance Type**  | Free                  |

4. Click **Advanced** → **Add Environment Variable** for each variable below:

   | Key              | Value                   |
   | ---------------- | ----------------------- |
   | `NODE_ENV`       | `production`            |
   | `MONGODB_URI`    | your full Atlas URI     |
   | `JWT_SECRET`     | your long random secret |
   | `JWT_EXPIRES_IN` | `7d`                    |

   > Do **not** set `PORT` — Render injects it automatically.

5. Click **Create Web Service**. The first deploy takes ~2 minutes.

6. Your API will be live at:
   ```
   https://codecards-api.onrender.com
   ```

### 6.3 Verify the deployment

```bash
curl https://codecards-api.onrender.com/api/health
```

---

## 7. Deploy the Frontend — Netlify (free)

### Option A — Drag & Drop (quickest)

1. Go to [app.netlify.com](https://app.netlify.com).
2. On the **Sites** tab drag and drop the entire `frontend/` folder onto the page.
3. Netlify deploys it instantly and gives you a URL like `https://random-name.netlify.app`.

### Option B — Git-connected (recommended for ongoing updates)

1. Go to **Add new site** → **Import an existing project** → connect GitHub.
2. Select the `codecards` repo.
3. Configure:

   | Setting               | Value           |
   | --------------------- | --------------- |
   | **Base directory**    | `frontend`      |
   | **Build command**     | _(leave empty)_ |
   | **Publish directory** | `frontend`      |

4. Click **Deploy site**.

### 7.1 Update the API URL

After deploying the backend, update `frontend/js/api.js` line 3:

```js
// Before (local dev)
const API_BASE = "http://localhost:5000/api";

// After (production)
const API_BASE = "https://codecards-api.onrender.com/api";
```

Commit and push — Netlify redeploys automatically.

---

## 8. Update CORS for Production

By default the backend allows all origins. In production, restrict it to your Netlify domain.

Edit `backend/index.js`:

```js
// Replace the open cors() call:
app.use(cors());

// With:
const allowedOrigins = [
  "http://localhost:5500", // VS Code Live Server
  "http://127.0.0.1:5500",
  "https://your-site.netlify.app", // ← your actual Netlify URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
```

---

## 9. Alternative Deployment Targets

### Backend alternatives

| Platform         | Notes                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **Railway**      | `railway up` from the `backend/` folder; auto-detects Node.js                |
| **Fly.io**       | `fly launch` → `fly deploy`; good free tier                                  |
| **Heroku**       | Add a `Procfile`: `web: node server.js`; push to Heroku remote               |
| **VPS (Ubuntu)** | Install Node, clone repo, use `pm2 start server.js`, add Nginx reverse proxy |

### Frontend alternatives

| Platform         | Notes                                                   |
| ---------------- | ------------------------------------------------------- |
| **Vercel**       | Connect repo, set root to `frontend/`, no build command |
| **GitHub Pages** | Push `frontend/` contents to a `gh-pages` branch        |
| **Surge.sh**     | `cd frontend && surge` — one-command deploy             |

---

## 10. Environment Variables Reference

| Variable         | Required | Default       | Description                                |
| ---------------- | -------- | ------------- | ------------------------------------------ |
| `PORT`           | No       | `5000`        | HTTP port (auto-set by Render)             |
| `NODE_ENV`       | Yes      | `development` | `development` or `production`              |
| `MONGODB_URI`    | Yes      | —             | Full MongoDB Atlas connection string       |
| `JWT_SECRET`     | Yes      | —             | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | Yes      | `7d`          | Token expiry — e.g. `7d`, `24h`, `3600`    |

---

## 11. Production Checklist

- [ ] `MONGODB_URI` set correctly (no double `@@`, no spaces)
- [ ] `JWT_SECRET` is long, random, and **not** the development value
- [ ] `NODE_ENV=production` is set on the server
- [ ] MongoDB Atlas Network Access allows the server's IP (or `0.0.0.0/0`)
- [ ] CORS is locked down to the real frontend origin
- [ ] `frontend/js/api.js` points to the live backend URL
- [ ] Health endpoint responds: `GET /api/health` → `{ status: "ok" }`
- [ ] Register a new user → login → create deck → add cards → take quiz end-to-end
- [ ] `.env` is in `.gitignore` and not committed to the repository

---

## 12. Troubleshooting

| Symptom                               | Likely Cause                                     | Fix                                                                             |
| ------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `Protocol and host list are required` | Double `@@` in URI                               | Remove the extra `@` from `.env`                                                |
| `querySrv ECONNREFUSED`               | Atlas cluster paused or IP not whitelisted       | Resume cluster; add your IP in Network Access                                   |
| `MongoServerError: bad auth`          | Wrong username/password in URI                   | Re-check Database Access credentials                                            |
| `401 No token provided`               | Calling a protected route without a JWT          | Include `Authorization: Bearer <token>` header                                  |
| `CORS error` in browser               | Backend CORS doesn't include the frontend origin | Add frontend URL to the `allowedOrigins` array                                  |
| Frontend shows blank page             | `api.js` still points to `localhost`             | Update `API_BASE` to the live backend URL                                       |
| Render spins down                     | Free tier sleeps after 15 min of inactivity      | First request after sleep takes ~30 s; upgrade or use a keep-alive ping service |
