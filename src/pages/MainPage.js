import React from "react";
import { Link } from "react-router-dom"; // Import the Link component

export default function MainPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-5">
          Effortless Quiz Creation with{" "}
          <span className="text-blue-600">Quizly</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-10">
          Turn documents into dynamic quizzes in moments. Engage your audience,
          test knowledge, and gain insights instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/getstarted"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-base md:text-lg text-center" // Added text-center for consistency
          >
            Start Creating Now
          </Link>
          <Link
            to="/signin"
            className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-base md:text-lg text-center" // Added text-center for consistency
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
