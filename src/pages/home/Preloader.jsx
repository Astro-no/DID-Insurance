import React from "react";
import "./Preloader.css";

const Preloader = () => {
  return (
    <div className="preloader-overlay">
      <div className="preloader-container">
        <div className="preloader"></div>
        <p className="loading-text">Loading</p>
      </div>
    </div>
  );
};
console.log("Preloader is rendering...");

export default Preloader;
