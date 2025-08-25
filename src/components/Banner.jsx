import React from "react";
import logo from "../assets/logo.png"; // assuming you saved your demo logo

const Banner = () => {
  return (
    <section className="w-full h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center justify-center text-center p-4">
      <img src={logo} alt="Forever Ecom Demo Logo" className="h-24 mb-6 drop-shadow-lg" />
      <h1 className="text-white text-5xl md:text-7xl font-extrabold drop-shadow-lg">
        Forever Ecom
      </h1>
      <p className="mt-4 text-white text-xl md:text-2xl font-semibold bg-black/30 px-4 py-2 rounded-lg">
        Demo App — Not an Official Release
      </p>
    </section>
  );
};

export default Banner;
