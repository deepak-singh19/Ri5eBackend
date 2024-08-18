const express = require('express');
const router = express.Router();
const Task = require('../database/models/task-model');

// POST API - Create a new task
router.post('/tasks', async (req, res) => {
  try {
    const { task, status, time } = req.body;

    // Check if the provided status is valid
    if (!['in progress', 'done', 'on hold'].includes(status)) {
      return res.status(400).send({ message: "Invalid status. Status should be 'in progress', 'done', or 'on hold'." });
    }

    const newTask = new Task({ task, status, time });
    await newTask.save();

    res.status(201).send({
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error creating task',
      error: error.message,
    });
  }
});

// GET API - Fetch all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).send({
      message: 'Tasks fetched successfully',
      tasks: tasks,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
});

// PATCH API - Update task status by task ID
router.patch('/tasks/:taskId/status', async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
  
      // Check if the provided status is valid
      if (!['in progress', 'done', 'on hold'].includes(status)) {
        return res.status(400).send({ message: "Invalid status. Status should be 'in progress', 'done', or 'on hold'." });
      }
  
      // Find the task by ID and update the status
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { status },
        { new: true } // Return the updated document
      );
  
      if (!updatedTask) {
        return res.status(404).send({ message: "Task not found" });
      }
  
      res.status(200).send({
        message: 'Task status updated successfully',
        task: updatedTask,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Error updating task status',
        error: error.message,
      });
    }
  });
  

module.exports = router;
