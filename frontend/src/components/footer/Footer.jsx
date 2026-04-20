import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white mt-20">

      {/* 🔥 TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

        {/* 🚌 Brand */}
        <div>
          <h2 className="text-2xl font-bold text-violet-500 mb-4">
            BusBooking
          </h2>
          <p className="text-sm text-neutral-400">
            Book your bus tickets easily and travel comfortably across cities.
            Safe, fast and reliable booking system.
          </p>
        </div>

        {/* 🔗 Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/bus" className="hover:text-white">Bus</Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-white">Bookings</Link>
            </li>
          </ul>
        </div>

        {/* 🌐 Social */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>

          <div className="flex gap-4">
            <a href="#" className="bg-white text-black p-2 rounded hover:bg-violet-600 hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="#" className="bg-white text-black p-2 rounded hover:bg-violet-600 hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="#" className="bg-white text-black p-2 rounded hover:bg-violet-600 hover:text-white transition">
              <FaTwitter />
            </a>
          </div>

          <p className="text-sm text-neutral-400 mt-4">
            Email: support@busbooking.com
          </p>
        </div>

      </div>

      {/* 🔻 BOTTOM */}
      <div className="text-center text-sm text-neutral-500 border-t border-neutral-700 py-4">
        © {new Date().getFullYear()} BusBooking. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;