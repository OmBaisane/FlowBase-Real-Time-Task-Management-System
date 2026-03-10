const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTaskStatus,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTask);

router.get("/", protect, getTasks);

router.patch("/:id/status", protect, updateTaskStatus);

module.exports = router;
