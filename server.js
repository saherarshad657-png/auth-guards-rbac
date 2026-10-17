
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Auth RBAC server is running!" });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    if (!process.env.JWT_SECRET ||
        process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
      throw new Error("Set a private JWT_SECRET in .env first");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
