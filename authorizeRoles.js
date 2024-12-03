const jwt = require("jsonwebtoken");

// Middleware to authorize the user based on role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    //@Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Wrong Token !!" });
    }
    //@Check the Role
    const userRole = decoded?.role; // Assuming role is saved in token
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next(); // Proceed if user has one of the authorized roles
  };
};

module.exports = authorizeRoles;
