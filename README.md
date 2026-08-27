# SkillHub — Full-Stack EdTech Website (Frontend + Backend + Database + Admin Panel)

A ready-to-run Node.js + Express + SQLite website with the same page structure as a typical
edtech landing page: Hero, Packages, Our Impact, Testimonials, FAQ — fully editable from an
admin panel (logo, packages + images, FAQ, impact numbers, testimonials).

> **Note on content:** This is built with original placeholder text, a generated placeholder
> logo, and generated placeholder images — not copied from any existing website. Replace
> everything (logo, package images, testimonial photos, copy) with your own brand's content
> through the admin panel once it's running.

## 1. Requirements
- Node.js 18+ installed (https://nodejs.org)

## 2. Install & Run

```bash
cd skillhub
npm install
npm start
```

The site will be available at:
- **Public site:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin/login

## 3. Default Admin Login

```
Username: admin
Password: Admin@123
```

**Change this password immediately** — log in, scroll to "Change Admin Password" in the
dashboard, and set a new one. The password is stored as a bcrypt hash in the database, never
in plain text.

## 4. What you can edit from the Admin Panel
- **Logo & Site Info** — upload a new logo, edit site name, hero heading/subtext, contact info
- **Our Impact** — the 4 stat numbers (students, courses, mentors, awards)
- **Packages** — add/edit/delete packages: title, price, included courses, rating, image
- **Testimonials** — add/edit/delete testimonials: name, role, message, photo
- **FAQ** — add/edit/delete question & answer pairs

All changes save instantly to the SQLite database (`db/skillhub.sqlite`) and reflect
immediately on the public site — no code changes needed.

## 5. Project Structure

```
skillhub/
├── server.js              # Express app entry point
├── db/
│   ├── database.js        # SQLite schema + auto-seed on first run
│   └── skillhub.sqlite    # created automatically on first run
├── middleware/
│   ├── auth.js             # protects /admin routes
│   └── upload.js           # multer image upload config
├── routes/
│   ├── public.js           # homepage route
│   └── admin.js             # login + all CRUD routes
├── views/
│   ├── index.ejs            # public homepage
│   └── admin/
│       ├── login.ejs
│       └── dashboard.ejs
└── public/
    ├── css/                 # style.css (site), admin.css (dashboard)
    ├── js/main.js           # smooth scroll
    └── uploads/             # uploaded logo / package / testimonial images
```

## 6. Deploying it live
- Any Node host works (Render, Railway, a VPS, etc.) — just run `npm install && npm start`.
- Set the `SESSION_SECRET` environment variable to a long random string in production.
- Put the app behind HTTPS so the admin login cookie is transmitted securely.
- Back up `db/skillhub.sqlite` regularly — it holds all your content and the admin password.

## 7. Security notes already built in
- Passwords hashed with bcrypt (never stored in plain text)
- Admin routes protected by session middleware — no session, no access
- File uploads restricted to image types, capped at 3MB
- Session store persisted in SQLite (`db/sessions.sqlite`), not memory
