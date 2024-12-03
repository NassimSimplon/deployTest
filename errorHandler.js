// Utility function for handling errors
 const handleError = (res, error, message = "Internal server error", statusCode = 500) => {
    console.error(`[ERROR] ${message}: ${error.message}`);
    res.status(statusCode).json({ message, error: error.message });
  };
  module.exports = handleError