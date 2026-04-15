# Vinodha Estates — Deploy in 30 Minutes 🚀

## ✅ What was fixed

1. **Created the missing `routes/auth.js`** — this was the cause of your login error. Your `server.js` requires `./routes/auth`, but the `auth.js` you had was actually middleware (the `protect` function), not the login route. **Now login will work.**
2. **Created missing `models/Admin.js` and `models/Property.js`** with bcrypt password hashing.
3. **Reorganized into proper folders** (`routes/`, `middleware/`, `models/`, `public/`, `public/admin/`).
4. **Upgraded `server.js`** to serve the public website AND admin panel from the same Node server — one deployment, no CORS issues.
5. **Fixed `admin.js` API_BASE** to use relative `/api` (works locally and in production).
6. **Added `.gitignore` and `.env.example`** for clean deployment.

---

## 📁 Final Project Structure

```
vinodha-backend/
├── server.js
├── seed.js
├── package.json
├── .env                  ← your secrets (DO NOT commit)
├── .env.example
├── .gitignore
├── middleware/
│   └── auth.js           ← protect middleware (JWT verify)
├── models/
│   ├── Admin.js          ← NEW
│   └── Property.js       ← NEW
├── routes/
│   ├── auth.js           ← NEW (fixes login!)
│   └── properties.js
├── public/               ← public website
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── admin/            ← admin panel
│       ├── login.html
│       ├── dashboard.html
│       ├── admin.css
│       └── admin.js
└── uploads/              ← created automatically
```

---

## 🧪 Test Locally First (5 min)

```bash
cd vinodha-backend
npm install
npm run seed       # creates admin user from .env
npm start
```

Open these URLs:
- Public site: http://localhost:5000
- Admin login: http://localhost:5000/admin
- Admin email: `Vinodhaestate2026@gmail.com`
- Password: `Vinodha2026`

If login works locally → you're ready to deploy.

---

## 🌐 Deploy in 30 Minutes — Easiest Path: MongoDB Atlas + Render

### Step 1 — MongoDB Atlas (10 min, FREE forever)

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up.
2. Create a free **M0 cluster** (any region near India, e.g., Mumbai).
3. **Database Access** → Add user → username/password (save them).
4. **Network Access** → Add IP → **Allow Access from Anywhere (0.0.0.0/0)**.
5. **Connect** → Drivers → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>`, then add `/vinodha` before the `?`:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/vinodha?retryWrites=true&w=majority
   ```

### Step 2 — Push Code to GitHub (5 min)

```bash
cd vinodha-backend
git init
git add .
git commit -m "Vinodha Estates ready to deploy"
# Create empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/vinodha-backend.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy on Render (10 min, FREE)

1. Go to https://render.com → sign up with GitHub.
2. **New + → Web Service** → connect your repo.
3. Settings:
   - **Name**: `vinodha-estates`
   - **Region**: Singapore (closest to India)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. **Environment Variables** (very important — add these):
   ```
   MONGO_URI = <your Atlas connection string from Step 1>
   JWT_SECRET = vinodha_jwt_secret_key_x8f3k2j9m4n7p1q5r6s8t0u2v4w6y8z0
   ADMIN_EMAIL = Vinodhaestate2026@gmail.com
   ADMIN_PASSWORD = Vinodha2026
   ```
5. Click **Create Web Service**. Wait ~3 min for build.
6. **Seed the admin user** — In Render dashboard → your service → **Shell** tab → run:
   ```bash
   npm run seed
   ```
   You should see: `✅ Admin created`

### Step 4 — Done! 🎉

Your site is live at:
- **Public**: `https://vinodha-estates.onrender.com`
- **Admin**: `https://vinodha-estates.onrender.com/admin`

---

## ⚠️ IMPORTANT — Render Free Tier Limitations

1. **Sleep after 15 min of inactivity** — first request takes ~30s to wake up. For production, upgrade to $7/mo Starter plan.
2. **Uploaded images are LOST on every restart** (ephemeral filesystem). For permanent image storage, integrate Cloudinary (10 min change). I can do this if you want — just ask.

For client delivery today, this is fine — but tell the client to either:
- Upgrade Render to paid ($7/mo) for persistent storage, or
- Move image uploads to Cloudinary (recommended).

---

## 🔧 Alternative: Railway (also 10 min)

1. https://railway.app → New Project → Deploy from GitHub.
2. Add same env vars as above.
3. Add a Volume mount at `/app/uploads` for persistent images (Railway supports this).
4. Open generated URL → done.

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| Login says "Invalid email or password" | Run `npm run seed` again. Double-check ADMIN_EMAIL in env vars matches what you type. |
| Login spinner stuck / network error | Check browser console. Likely MONGO_URI wrong or 0.0.0.0/0 not whitelisted in Atlas. |
| Images don't appear after upload | Render free tier wipes files on restart. Use Cloudinary. |
| "Cannot GET /admin" | Make sure `public/admin/login.html` exists in repo. |
| Build fails on Render | Check `package.json` has `"start": "node server.js"` and Node 18+. |
