import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBus } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      
      {/* Animation/Icon Section */}
      <div className="relative mb-8">
        <div className="text-9xl font-black text-gray-100 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaBus className="text-6xl text-violet-600 animate-bounce" />
        </div>
      </div>

      {/* Text Section */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Oops! You've taken a wrong turn. 🗺️
      </h1>
      <p className="text-gray-600 max-w-md mb-10 leading-relaxed">
        The page you're looking for doesn't exist or has been moved to a different route. 
        Don't worry, even the best drivers get lost sometimes!
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-violet-200"
        >
          <FaHome size={20} />
          Go Back Home
        </Link>
        <Link
          to="/bus"
          className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 hover:border-violet-200 text-gray-700 px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95"
        >
          Explore Buses
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="mt-16 text-gray-300">
        <div className="flex justify-center gap-4 text-2xl opacity-20">
          <span>🚍</span>
          <span>🛣️</span>
          <span>🚦</span>
          <span>📍</span>
        </div>
      </div>

    </div>
  );
};

export default NotFound;
