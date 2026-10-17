
const express = require("express");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your protected dashboard!",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.get("/admin", verifyToken, allowRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome to the admin panel!"
  });
});

module.exports = router;
