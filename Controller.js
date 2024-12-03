const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const {db} = require("./SqlDb"); // Import the pg db instance
const router = express.Router();

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    process.env.JWT_SECRET, 
  );
};

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

// @Register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("username").notEmpty().withMessage("Username is required."),
    body("phone").notEmpty().withMessage("Phone number is required."),
  ],
  async (req, res) => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { username, email, phone, password, role } = req.body;

      // Check if the user already exists
      const userCheckQuery = "SELECT * FROM users WHERE email = $1";
      const userExists = await db.query(userCheckQuery, [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: "User already registered" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const insertUserQuery = `
        INSERT INTO users (username, email, phone, password, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, email, phone, role
      `;
      const values = [username, email, phone, hashedPassword, role || "user"];
      const newUser = await db.query(insertUserQuery, values);

      return res.status(201).json({
        message: "User registered successfully!",
        user: newUser.rows[0],
      });
    } catch (error) {
      console.error("Registration Error:", error.message);
      return res.status(500).json({
        error: "An error occurred during registration",
        details: error.message,
      });
    }
  }
);

// @LogIn
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res) => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { email, password } = req.body;

      // Find the user in the database
      const findUserQuery = "SELECT * FROM users WHERE email = $1";
      const userResult = await db.query(findUserQuery, [email]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ error: "Invalid email or password." });
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      // Generate token
      const token = generateToken(user);

      return res.status(200).json({
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login Error:", error.message);
      return res.status(500).json({
        error: "An error occurred during login.",
        details: error.message,
      });
    }
  }
);

module.exports = router;
