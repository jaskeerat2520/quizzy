import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import useClient from "../supabaseClient";

export default function LoggedInTopBar() {
  const navigate = useNavigate();
  const supabaseClient = useClient();
  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-black">
      <nav className="container mx-auto px-4 pl-80  h-16 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">quizly</h1>
        </div>{" "}
        <div className="flex items-center space-x-4">
          <div className="relative w-48 lg:w-64">
            <SearchBar />
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1 text-sm rounded-md bg-red-500 text-white font-medium hover:bg-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
}
