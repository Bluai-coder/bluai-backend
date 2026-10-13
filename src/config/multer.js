const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save inside uploads/audio
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // keep original name (or customize)
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = /wav|mp3|m4a|webm/;
    const allowedMimeTypes = /audio\/wav|audio\/mpeg|audio\/mp4|audio\/webm|audio\/x-m4a|audio\/m4a/;
    
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype.toLowerCase();
    
    if (allowedExts.test(ext) && allowedMimeTypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  }
});

module.exports = upload;
 