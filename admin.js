const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const { requireAdmin } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");

const uploadLogo = makeUploader("logo");
const uploadPackage = makeUploader("packages");
const uploadTestimonial = makeUploader("testimonials");

function getSettings() {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const obj = {};
  rows.forEach((r) => (obj[r.key] = r.value));
  return obj;
}

// ---------- Login ----------
router.get("/login", (req, res) => {
  if (req.session.isAdmin) return res.redirect("/admin");
  res.render("admin/login", { error: null });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);

  if (!admin || !bcrypt.compareSync(password || "", admin.password_hash)) {
    return res.render("admin/login", { error: "Galat username ya password." });
  }

  req.session.isAdmin = true;
  req.session.adminUsername = admin.username;
  res.redirect("/admin");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

// ---------- Dashboard ----------
router.get("/", requireAdmin, (req, res) => {
  const settings = getSettings();
  const packages = db.prepare("SELECT * FROM packages ORDER BY sort_order ASC").all();
  const faqs = db.prepare("SELECT * FROM faqs ORDER BY sort_order ASC").all();
  const testimonials = db.prepare("SELECT * FROM testimonials ORDER BY sort_order ASC").all();

  res.render("admin/dashboard", {
    settings,
    packages,
    faqs,
    testimonials,
    adminUsername: req.session.adminUsername,
    saved: req.query.saved || null,
  });
});

// ---------- Settings: site info, hero, impact, logo ----------
router.post("/settings", requireAdmin, uploadLogo.single("logo"), (req, res) => {
  const fields = [
    "site_name", "hero_title", "hero_subtitle",
    "impact_students", "impact_courses", "impact_mentors", "impact_awards",
    "contact_email", "contact_phone", "contact_location",
  ];
  const upsert = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`);

  fields.forEach((f) => {
    if (req.body[f] !== undefined) upsert.run(f, req.body[f]);
  });

  if (req.file) {
    upsert.run("logo_path", "/uploads/logo/" + req.file.filename);
  }

  res.redirect("/admin?saved=settings");
});

// ---------- Packages CRUD ----------
router.post("/packages/add", requireAdmin, uploadPackage.single("image"), (req, res) => {
  const { title, price, courses, rating, students_text, sort_order } = req.body;
  const image_path = req.file ? "/uploads/packages/" + req.file.filename : "/uploads/packages/default-package.png";
  db.prepare(`INSERT INTO packages (title, price, image_path, courses, rating, students_text, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    title, price, image_path, courses, rating || "4.8", students_text || "1k+ students", Number(sort_order) || 0
  );
  res.redirect("/admin?saved=package-added");
});

router.post("/packages/:id/update", requireAdmin, uploadPackage.single("image"), (req, res) => {
  const { title, price, courses, rating, students_text, sort_order } = req.body;
  const existing = db.prepare("SELECT * FROM packages WHERE id = ?").get(req.params.id);
  if (!existing) return res.redirect("/admin");

  const image_path = req.file ? "/uploads/packages/" + req.file.filename : existing.image_path;

  db.prepare(`UPDATE packages SET title=?, price=?, image_path=?, courses=?, rating=?, students_text=?, sort_order=? WHERE id=?`)
    .run(title, price, image_path, courses, rating, students_text, Number(sort_order) || 0, req.params.id);

  res.redirect("/admin?saved=package-updated");
});

router.post("/packages/:id/delete", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM packages WHERE id = ?").run(req.params.id);
  res.redirect("/admin?saved=package-deleted");
});

// ---------- FAQ CRUD ----------
router.post("/faqs/add", requireAdmin, (req, res) => {
  const { question, answer, sort_order } = req.body;
  db.prepare("INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)")
    .run(question, answer, Number(sort_order) || 0);
  res.redirect("/admin?saved=faq-added");
});

router.post("/faqs/:id/update", requireAdmin, (req, res) => {
  const { question, answer, sort_order } = req.body;
  db.prepare("UPDATE faqs SET question=?, answer=?, sort_order=? WHERE id=?")
    .run(question, answer, Number(sort_order) || 0, req.params.id);
  res.redirect("/admin?saved=faq-updated");
});

router.post("/faqs/:id/delete", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM faqs WHERE id = ?").run(req.params.id);
  res.redirect("/admin?saved=faq-deleted");
});

// ---------- Testimonials CRUD ----------
router.post("/testimonials/add", requireAdmin, uploadTestimonial.single("image"), (req, res) => {
  const { name, role, message, sort_order } = req.body;
  const image_path = req.file ? "/uploads/testimonials/" + req.file.filename : "/uploads/testimonials/default-avatar.png";
  db.prepare("INSERT INTO testimonials (name, role, message, image_path, sort_order) VALUES (?, ?, ?, ?, ?)")
    .run(name, role, message, image_path, Number(sort_order) || 0);
  res.redirect("/admin?saved=testimonial-added");
});

router.post("/testimonials/:id/update", requireAdmin, uploadTestimonial.single("image"), (req, res) => {
  const { name, role, message, sort_order } = req.body;
  const existing = db.prepare("SELECT * FROM testimonials WHERE id = ?").get(req.params.id);
  if (!existing) return res.redirect("/admin");

  const image_path = req.file ? "/uploads/testimonials/" + req.file.filename : existing.image_path;

  db.prepare("UPDATE testimonials SET name=?, role=?, message=?, image_path=?, sort_order=? WHERE id=?")
    .run(name, role, message, image_path, Number(sort_order) || 0, req.params.id);

  res.redirect("/admin?saved=testimonial-updated");
});

router.post("/testimonials/:id/delete", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
  res.redirect("/admin?saved=testimonial-deleted");
});

// ---------- Change admin password ----------
router.post("/change-password", requireAdmin, (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(req.session.adminUsername);

  if (!bcrypt.compareSync(current_password || "", admin.password_hash)) {
    return res.redirect("/admin?saved=wrong-password");
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(newHash, admin.id);
  res.redirect("/admin?saved=password-changed");
});

module.exports = router;
