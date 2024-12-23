import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
   heading: { type: String, required: true },
   description: { type: String, required: true },
});

const taskModel = mongoose.models.task || mongoose.model("task", taskSchema);
export default taskModel;
