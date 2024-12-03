const multer = require("multer");
const path = require("path");

// Constants for upload configuration
const UPLOAD_FOLDER = path.join(__dirname, "../uploads");
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Generate a unique file name based on the current timestamp and random number
 * @param {string} originalName - Original file name
 * @returns {string} - Unique file name with extension
 */
const generateUniqueFileName = (originalName) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(originalName).toLowerCase();
  return `${uniqueSuffix}${ext}`;
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER); // Set destination folder for uploads
  },
  filename: (req, file, cb) => {
    const uniqueFileName = generateUniqueFileName(file.originalname);
    cb(null, uniqueFileName);
  },
});

// File filter for validating file types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    // Return an error with a custom message for invalid file types
    return cb(
      new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`)
    );
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // Set maximum file size limit
  },
});

/**
 * Error handling middleware for file uploads
 * Handles both Multer-specific errors and other errors
 */
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors, such as file size or limits
    console.error(`[ERROR] Multer error: ${err.message}`);
    return res.status(400).json({
      error: `File upload error: ${err.message}`,
    });
  } else if (err) {
    // Handle other errors, like file type validation
    console.error(`[ERROR] ${err.message}`);
    return res.status(400).json({
      error: `Invalid file: ${err.message}`,
    });
  }
  next(); // Pass the request to the next middleware if no error
};

module.exports = {
  upload,
  uploadErrorHandler,
};
