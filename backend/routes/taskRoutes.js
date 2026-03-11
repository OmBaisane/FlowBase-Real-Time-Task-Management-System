const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const taskController = require("../controllers/taskController");

router.get("/", protect, taskController.getTasks);

router.post("/", protect, taskController.createTask);

router.put("/:id", protect, taskController.updateTask);

router.delete("/:id", protect, taskController.deleteTask);

module.exports = router;