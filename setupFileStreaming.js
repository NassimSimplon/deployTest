const express = require("express");
const path = require("path");

// Serve static files securely
const setupFileStreaming = (app) => {
  // Middleware for serving files from the uploads folder
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"), {
      setHeaders: (res, filePath) => {
        // Set security headers for file responses
        res.setHeader("Content-Disposition", "inline"); // Allow inline file display
        res.setHeader("X-Content-Type-Options", "nosniff"); // Prevent MIME type sniffing
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      },
    })
  );

  console.log("File streaming enabled for /uploads route.");
};

module.exports = setupFileStreaming;
