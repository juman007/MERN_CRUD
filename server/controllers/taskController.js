import taskModel from "../models/taskModel.js";

export const addtask = async (req, res) => {
   try {
      const { heading, description } = req.body;

      // Create a new user document
      const newUser = new taskModel({ heading, description });
      const savedUser = await newUser.save();

      res.status(201).json(savedUser);
   } catch (error) {
      res.status(500).json({
         error: "Error creating user",
         details: error.message,
      });
   }
};

export const getTask = async (req, res) => {
   try {
      const users = await taskModel.find();
      res.status(200).json(users);
   } catch (error) {
      res.status(500).json({
         error: "Error fetching users",
         details: error.message,
      });
   }
};

export const deleteTask = async (req, res, next) => {
   const taskId = req.params.id; // Get taskId from URL parameter

   try {
      const task = await taskModel.findByIdAndDelete(taskId);
      if (!task) {
         return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json({ message: "Task deleted successfully", task });
   } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Server error while deleting task" });
   }
};

export const updateTask = async (req, res, next) => {
   const taskId = req.params.id; // Get taskId from URL parameter
   const { heading, description } = req.body; // Get updated heading and description from request body

   try {
      // Find the task by ID and update it
      const task = await taskModel.findByIdAndUpdate(
         taskId,
         { heading, description },
         { new: true } // To return the updated task
      );

      if (!task) {
         return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json({ message: "Task updated successfully", task });
   } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Server error while updating task" });
   }
};
