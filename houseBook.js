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
const cPanelDb = require('./CpanelDb');

async function testConnection() {
    try {
        // Get a connection from the pool
        const connection = await cPanelDb.getConnection();

        // If we successfully got a connection, we can log a success message
        console.log('Connected successfully to the database.',connection);

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

// Call the testConnection function to test the connection

testConnection();
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
  origin: process.env.CORS_ORIGIN,
};

///@CORS
app.use(cors(corsOptions));
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
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
app.use("/user", registerLimiter, userController);
app.use("/meeting", registerLimiter, meetingController);
app.use("/houses", registerLimiter, housesController);
app.use("/rent", registerLimiter, rentsController);

app.get("/omda", (req, res) => {
  res.send("Hello, this is the root route!");
});

// app.use("/uploads", express.static("uploads"));
//Port
const PORT = process.env.PORT;

// Start the server
const startServer = (port, app) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
  });

  server.on("error", (error) => {
    console.error(`❌ Server failed to start: ${error.message}`);
  });

  return server;
};

// Usage
startServer(PORT, app);

