// DotEnv
require("./Dotenv");
// Express setup
const express = require("express");
const app = express();

// Middleware imports
const cors = require("cors");
const rateLimit = require("express-rate-limit");

//@Sql DataBase
// const { pool } = require("./SqlDb");
// // Connect to the Sql database
// pool();
 
//Stream Images
const setupFileStreaming = require("./setupFileStreaming"); // Adjust the path as needed

// Route Controllers
const authController = require("./Controller");
const userController = require("./Users");
const meetingController = require("./Meetings");
const housesController = require("./House");
const rentsController = require("./Rents");

//Cors Option
const corsOptions = {
  origin: 'https://intacthome.tn' || 'https://intacthome.tn:1' || process.env.CORS_ORIGIN ||  'http://localhost:3306' ,
};

///@CORS
app.use(cors());
// Middleware to parse URL-encoded data
// app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(express.json());

// Rate Limiting: Protect registration route from brute-force attacks
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per IP
  message: {
    message:
      "Too many registration attempts from this IP, please try again later.",
  },
});

// Enable file streaming
setupFileStreaming(app);

// Apply routes
app.use("/auth", registerLimiter, authController);
app.use("/user", userController);
app.use("/meeting", registerLimiter, meetingController);
app.use("/houses", registerLimiter, housesController);
app.use("/rent", registerLimiter, rentsController);

app.get("/omda", (req, res) => {
  res.send("Hello, this is the root route!");
});

// app.use("/uploads", express.static("uploads"));
//Port
const PORT = process.env.PORT || 3000;

// Start the server
const startServer = (port, app) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${server.address().port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is in use. Trying another port...`);
      // Retry on a different port
      startServer(0, app); // Passing 0 allows the OS to assign an available port
    } else {
      console.error(`❌ Server failed to start: ${error.message}`);
    }
  });

  return server;
};

// Usage
startServer(PORT, app);
