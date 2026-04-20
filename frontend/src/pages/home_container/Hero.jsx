import React from "react";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">

      <div className="
        max-w-7xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-16 sm:py-20 lg:py-24
        text-center
      ">

        {/* TITLE */}
        <h1 className="
          text-2xl sm:text-3xl md:text-4xl lg:text-5xl
          font-bold leading-tight
        ">
          Book Bus Tickets Easily 🚌
        </h1>

        {/* SUBTITLE */}
        <p className="
          mt-3 sm:mt-4
          text-sm sm:text-base md:text-lg
          text-white/90
        ">
          Safe, Fast & Reliable Booking
        </p>

        {/* EXTRA LINE (🔥 UX BOOST) */}
        <p className="
          mt-2 text-xs sm:text-sm text-white/70
        ">
          Compare buses • Choose seats • Instant booking
        </p>

        {/* CTA BUTTON */}
        <div className="mt-6 sm:mt-8">
          <a
            href="#search"
            className="
              inline-block
              bg-white text-violet-600
              px-5 py-2.5 sm:px-6 sm:py-3
              rounded-lg
              font-medium
              hover:bg-gray-100
              transition
            "
          >
            Search Buses 🔍
          </a>
        </div>

      </div>
    </div>
  );
};

export default Hero;