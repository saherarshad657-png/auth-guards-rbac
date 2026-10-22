
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

let connectionPromise;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

// Ensure MongoDB is connected before processing requests.
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({ message: "Database connection failed." });
  }
});

app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Auth RBAC server is running!" });
});

module.exports = app;

// Run the local server when using: node server.js
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
