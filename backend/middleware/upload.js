const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});


const fileFilter = (req, file, cb) => {
  const ok = /pdf|docx/.test(path.extname(file.originalname).toLowerCase());
  ok ? cb(null, true) : cb(new Error("Only PDF/DOCX files are allowed"));
};


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
