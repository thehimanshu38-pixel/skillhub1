const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "skillhub.sqlite"));

db.pragma("journal_mode = WAL");

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  image_path TEXT,
  courses TEXT, -- newline separated
  rating TEXT DEFAULT '4.8',
  students_text TEXT DEFAULT '1k+ students',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT,
  message TEXT NOT NULL,
  image_path TEXT,
  sort_order INTEGER DEFAULT 0
);
`);

// ---------- Default seed (only runs once) ----------
function seedIfEmpty() {
  const adminCount = db.prepare("SELECT COUNT(*) AS c FROM admins").get().c;
  if (adminCount === 0) {
    const hash = bcrypt.hashSync("Admin@123", 10);
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run("admin", hash);
    console.log("Seeded default admin -> username: admin | password: Admin@123");
  }

  const settingsCount = db.prepare("SELECT COUNT(*) AS c FROM settings").get().c;
  if (settingsCount === 0) {
    const defaults = {
      site_name: "SkillHub",
      logo_path: "/uploads/logo/default-logo.png",
      hero_title: "Turn Your Skills Into Success",
      hero_subtitle: "Explore practical digital programs, master in-demand skills, and build a career you're proud of.",
      impact_students: "12,000+",
      impact_courses: "40+",
      impact_mentors: "25+",
      impact_awards: "8+",
      contact_email: "hello@skillhub.example",
      contact_phone: "+91 90000 00000",
      contact_location: "Bhopal, India",
    };
    const insert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(defaults)) insert.run(k, v);
  }

  const packageCount = db.prepare("SELECT COUNT(*) AS c FROM packages").get().c;
  if (packageCount === 0) {
    const insert = db.prepare(`INSERT INTO packages (title, price, image_path, courses, rating, students_text, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insert.run("Starter Package", "₹599", "/uploads/packages/default-package.png",
      "Canva Design Basics\nSocial Media Growth\nContent Writing", "4.7", "900+ students", 1);
    insert.run("Growth Package", "₹1,499", "/uploads/packages/default-package.png",
      "Digital Marketing\nInstagram Marketing\nSales Fundamentals", "4.8", "1.2k+ students", 2);
    insert.run("Pro Package", "₹4,999", "/uploads/packages/default-package.png",
      "Advanced Excel\nPublic Speaking\nEmail Marketing\nFacebook Ads", "4.9", "1.5k+ students", 3);
  }

  const faqCount = db.prepare("SELECT COUNT(*) AS c FROM faqs").get().c;
  if (faqCount === 0) {
    const insert = db.prepare("INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)");
    insert.run("What is SkillHub?", "SkillHub is an online learning platform offering practical, job-ready digital skill courses.", 1);
    insert.run("Do I get a certificate?", "Yes, you receive a certificate of completion for every course you finish.", 2);
    insert.run("Can I access courses on mobile?", "Yes, all courses are accessible on mobile, tablet, and desktop.", 3);
    insert.run("How do I get support?", "You can reach our support team any time through the Contact page.", 4);
  }

  const testimonialCount = db.prepare("SELECT COUNT(*) AS c FROM testimonials").get().c;
  if (testimonialCount === 0) {
    const insert = db.prepare(`INSERT INTO testimonials (name, role, message, image_path, sort_order)
      VALUES (?, ?, ?, ?, ?)`);
    insert.run("Aarav Mehta", "Student", "The courses were practical and easy to follow. I learned skills I could use right away.", "/uploads/testimonials/default-avatar.png", 1);
    insert.run("Priya Nair", "Freelancer", "Great mentorship and clear video lessons. It helped me start freelancing with confidence.", "/uploads/testimonials/default-avatar.png", 2);
  }
}

seedIfEmpty();

module.exports = db;
