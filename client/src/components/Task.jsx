import React, { useContext, useState, useEffect } from "react";
import axios from "axios"; // Make sure axios is imported
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Task = () => {
   const { userData, backendUrl, setIsLoggedIn } = useContext(AppContext); // Get backendUrl from context
   const user = userData?.userData;
   const navigate = useNavigate(); // Initialize navigate
   // Redirect to login if userData is not available
   useEffect(() => {
      if (!setIsLoggedIn) {
         navigate("/login"); // Redirect to login page
      } else {
         fetchTasks(); // If user exists, fetch tasks
      }
   }, [user, navigate]); // Dependency on user to check login status

    
    
   // State to hold task heading, description, and tasks list
   const [taskHeading, setTaskHeading] = useState("");
   const [taskDescription, setTaskDescription] = useState("");
   const [tasks, setTasks] = useState([]); // State to store fetched tasks

   // Fetch all tasks from the backend
   const fetchTasks = async () => {
      try {
         const response = await axios.get(`${backendUrl}/api/task/data`);
         setTasks(response.data); // Assuming backend returns tasks as an array
      } catch (error) {
         console.error("Error fetching tasks:", error);
      }
   };

   // Handler to log task data and send to backend
   const handleAddTask = async () => {
      console.log("Task Heading:", taskHeading);
      console.log("Task Description:", taskDescription);

      const data = {
         heading: taskHeading,
         description: taskDescription,
      };

      try {
         // POST request to backend to add task
         const response = await axios.post(`${backendUrl}/api/task/add`, data);

         // If request is successful, log the response and reset the form
         console.log("Task added successfully:", response.data);
         setTaskHeading("");
         setTaskDescription("");

         // Fetch the updated list of tasks
         fetchTasks();
      } catch (error) {
         console.error("Error adding task:", error);
      }
   };

   // Handler to delete a task
   const handleDeleteTask = async (taskId) => {
      try {
         const response = await axios.delete(
            `${backendUrl}/api/task/delete/${taskId}`
         );
         console.log("Task deleted successfully:", response.data);
         fetchTasks(); // Fetch the updated list of tasks after deletion
      } catch (error) {
         console.error("Error deleting task:", error);
      }
   };

   // Handler to update a task
   const handleUpdateTask = async (
      taskId,
      updatedHeading,
      updatedDescription
   ) => {
      const updatedData = {
         heading: updatedHeading,
         description: updatedDescription,
      };

      try {
         const response = await axios.put(
            `${backendUrl}/api/task/update/${taskId}`,
            updatedData
         );
         console.log("Task updated successfully:", response.data);
         fetchTasks(); // Fetch the updated list of tasks after updating
      } catch (error) {
         console.error("Error updating task:", error);
      }
   };

   // Use useEffect to fetch tasks when the component mounts
   useEffect(() => {
      fetchTasks();
   }, []); // Empty dependency array means this runs only once when component mounts

   return (
      <div className="flex flex-col items-center gap-8 p-4 sm:p-8 bg-gray-50 min-h-screen">
         {/* Header */}
         <div className="text-center">
            <h1 className="flex items-center justify-center text-xl sm:text-3xl font-medium mb-4">
               Hey {user ? user.name : "Developer"}!
               <img
                  className="w-8 aspect-square ml-2"
                  src={assets.hand_wave}
                  alt="Wave emoji"
               />
            </h1>
            <p className="text-gray-600">Manage your tasks efficiently!</p>
         </div>

         {/* Task Input */}
         <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
               Add a New Task
            </h2>
            <div className="flex flex-col gap-4">
               <input
                  type="text"
                  placeholder="Task heading"
                  value={taskHeading}
                  onChange={(e) => setTaskHeading(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <textarea
                  placeholder="Task description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
               ></textarea>
               <button
                  onClick={handleAddTask}
                  className="bg-blue-500 text-white font-semibold rounded-md py-2 hover:bg-blue-600"
               >
                  Add Task
               </button>
            </div>
         </div>

         {/* View Tasks */}
         <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
               View Tasks
            </h2>
            <div className="space-y-4">
               {/* Dynamically display tasks */}
               {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                     <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4"
                     >
                        <h3 className="text-md sm:text-lg font-medium">
                           {task.heading}
                        </h3>
                        <p className="text-gray-600 mt-2">{task.description}</p>
                        <div className="flex gap-4 mt-4">
                           {/* Delete Button */}
                           <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-red-500"
                           >
                              <i className="fa-solid fa-trash"></i>
                           </button>

                           {/* Update Button */}
                           <button
                              onClick={() => {
                                 const updatedHeading = prompt(
                                    "Enter new task heading",
                                    task.heading
                                 );
                                 const updatedDescription = prompt(
                                    "Enter new task description",
                                    task.description
                                 );
                                 if (updatedHeading && updatedDescription) {
                                    handleUpdateTask(
                                       task._id,
                                       updatedHeading,
                                       updatedDescription
                                    );
                                 }
                              }}
                              className="text-green-500"
                           >
                              <i className="fa-solid fa-pen-to-square"></i>
                           </button>
                        </div>
                     </div>
                  ))
               ) : (
                  <p className="text-gray-600">No tasks available.</p>
               )}
            </div>
         </div>
      </div>
   );
};

export default Task;
