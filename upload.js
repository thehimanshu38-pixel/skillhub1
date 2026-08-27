const multer = require("multer");
const path = require("path");

function makeUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "public", "uploads", subfolder));
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

  return multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: function (req, file, cb) {
      const allowed = /jpeg|jpg|png|webp|gif/;
      const ok = allowed.test(path.extname(file.originalname).toLowerCase());
      cb(ok ? null : new Error("Only image files are allowed (jpg, png, webp, gif)"), ok);
    },
  });
}

module.exports = { makeUploader };
