import express from "express";
import { getUserData } from "../controllers/userController.js";
// import userAuth from "../middleware/userAuth.js
import {
   addtask,
   deleteTask,
   getTask,
   updateTask,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.post("/add", addtask);
taskRouter.get("/data", getTask);
taskRouter.delete("/delete/:id", deleteTask);
taskRouter.put("/update/:id", updateTask);

export default taskRouter;
