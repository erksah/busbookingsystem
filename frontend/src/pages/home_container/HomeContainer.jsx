import React from "react";
import Hero from "./Hero";
import Destination from "../../components/destination/Destination";

const HomeContainer = () => {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <div className="relative">
        <Hero />

        {/* 🔥 RESPONSIVE FLOAT SEARCH */}
        <div className="
          px-4 sm:px-6 lg:px-8
          mt-[-40px] sm:mt-[-60px]
          md:absolute md:left-0 md:right-0 md:bottom-[-70px]
          md:px-16 lg:px-28
          z-20
        ">
          <Destination />
        </div>
      </div>

      {/* 🔥 SPACE FIX */}
      <div className="h-[60px] md:h-[120px]"></div>

    </div>
  );
};

export default HomeContainer;