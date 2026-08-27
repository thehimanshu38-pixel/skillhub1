const express = require("express");
const router = express.Router();
const db = require("../db/database");

function getSettings() {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const obj = {};
  rows.forEach((r) => (obj[r.key] = r.value));
  return obj;
}

router.get("/", (req, res) => {
  const settings = getSettings();
  const packages = db.prepare("SELECT * FROM packages ORDER BY sort_order ASC").all()
    .map((p) => ({ ...p, courses: p.courses ? p.courses.split("\n") : [] }));
  const faqs = db.prepare("SELECT * FROM faqs ORDER BY sort_order ASC").all();
  const testimonials = db.prepare("SELECT * FROM testimonials ORDER BY sort_order ASC").all();

  res.render("index", { settings, packages, faqs, testimonials });
});

module.exports = router;
