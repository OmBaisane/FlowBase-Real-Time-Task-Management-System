const Project = require("../models/Project");

// CREATE PROJECT (ADMIN)

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL PROJECTS

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("createdBy", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
