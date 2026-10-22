
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from the .env file.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");
}

// User model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    role: {
      type: String,
      enum: ["admin", "user", "editor"],
      default: "user"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    joined: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: String,
      default: "Just now"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("DashboardUser", userSchema);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ message: "Dashboard API and MongoDB are running!" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ message: "Database connection failed." });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    await connectToDatabase();

    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch users failed:", error.message);
    res.status(500).json({ message: "Could not fetch users." });
  }
});

// Add a user
app.post("/api/users", async (req, res) => {
  try {
    await connectToDatabase();

    const { name, email, role, status } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Name and email are required."
      });
    }

    const user = await User.create({
      name,
      email,
      role,
      status
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists."
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error("Add user failed:", error.message);
    res.status(500).json({ message: "Could not add user." });
  }
});

// Update a user
app.put("/api/users/:id", async (req, res) => {
  try {
    await connectToDatabase();

    const { name, email, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists."
      });
    }

    console.error("Update user failed:", error.message);
    res.status(500).json({ message: "Could not update user." });
  }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
  try {
    await connectToDatabase();

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    console.error("Delete user failed:", error.message);
    res.status(500).json({ message: "Could not delete user." });
  }
});

app.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
});
