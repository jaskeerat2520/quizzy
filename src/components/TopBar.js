import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <div className="bg-black">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">quizly</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/signin"
            className="px-3 py-1 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/getstarted"
            className="px-3 py-1 text-sm rounded-md bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
