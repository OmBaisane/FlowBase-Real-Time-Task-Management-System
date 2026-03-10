const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

// CREATE PROJECT (ADMIN ONLY)

router.post("/", protect, adminOnly, createProject);

// GET PROJECTS

router.get("/", protect, getProjects);

module.exports = router;
