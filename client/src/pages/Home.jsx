import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Task from "../components/Task";

const Home = () => {
   return (
      <div className="flex flex-col mt-20 min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
         <Navbar />
         {/* <Header /> */}
         <Task />
      </div>
   );
};

export default Home;
