import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "./context/AppContext";

const App = () => {
   const { isLoggedIn, userData } = useContext(AppContext); // Assuming this is coming from your context
   const navigate = useNavigate();
   console.log(userData);
   console.log();

   // Check login status and redirect if not logged in
   useEffect(() => {
      if (isLoggedIn) {
         navigate("/"); // Redirect to login page if not logged in
      } else {
         // If not logged in, redirect to home page
         navigate("/login"); // Redirect to login page if not logged in
      }
   }, [isLoggedIn, navigate]);
   return (
      <div>
         <ToastContainer />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-verify" element={<EmailVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
         </Routes>
      </div>
   );
};

export default App;
