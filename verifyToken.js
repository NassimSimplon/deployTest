const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access token is missing!" });
        }
        // Verify the token
        const decoded = jwt.verify(token,  process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Wrong Token !!" });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token!", error: error.message });
    }
};

module.exports = verifyToken;
