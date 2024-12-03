// Import Mongoose
const mongoose = require("mongoose");

// Mongoose configuration and best practices
mongoose.set('strictQuery', false); // Disable strict query to allow flexible querying (optional)

// Function to connect to the database
const db_connection = async () => {
  try {
    // Using async/await for better error handling and readability
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zpevv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`,
      {
        useNewUrlParser: true,    // Use new parser for URL string
        useUnifiedTopology: true, // Use new unified topology engine for better reliability
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }
    );
    console.log("✅ Database connected successfully!");

    // No need to monitor or optimize for now on a small collection.
    // await monitorAndOptimizeDatabase();

    // Optionally, you can re-enable the function when collection grows.

  } catch (error) {
    console.error("❌ Failed to connect to the database. Error:", error.message);
    process.exit(1);  // Exit the process if connection fails, to avoid running with a failed DB connection
  }
};

{
  `
  // Function to monitor and optimize the database
const monitorAndOptimizeDatabase = async () => {
  try {
    // Example: Monitor the stats of the "houses" collection
    const collection = mongoose.connection.db.collection("houses");

    // Get collection stats
    const stats = await collection.stats();
    console.log("Collection stats:", 'stats');

    // If index size is large, consider reindexing
    if (stats.indexSizes && stats.indexSizes["*"] > 1000000) { // Example threshold
      console.log("Reindexing collection due to large index size...");
      await collection.reIndex();
      console.log("✅ Reindexing completed successfully.");
    }
  } catch (error) {
    console.error("❌ Error monitoring/optimizing database:", error.message);
  }
};`}

// Export the connection function to be used in server.js or other modules
module.exports = db_connection;
