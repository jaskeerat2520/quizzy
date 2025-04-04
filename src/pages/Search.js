import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Adjust the path as needed
import SearchBar from "../components/SearchBar";

import { useNavigate } from "react-router-dom";
export default function Search() {
  const params = useParams();
  const query = params.query;
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    async function getSearchResults(query) {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("quizes")
          .select("*")
          .textSearch("name", `'${query}:*'`, {
            type: "plain",
            config: "english",
          });

        if (supabaseError) {
          console.error("Error fetching search results:", supabaseError);
          setError(supabaseError);
          setSearchResults([]);
        } else {
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error("An unexpected error occurred:", err);
        setError(err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }

    getSearchResults(query);
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">
          Error: {error.message || "An error occurred during search."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Search Results for "{query}"
      </h1>
      {searchResults.length === 0 ? (
        <p className="text-gray-600">No results found.</p>
      ) : (
        <ul className="space-y-4">
          {searchResults.map((result) => (
            <li
              key={result.id}
              className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Link
                to={`/quiz/${result.uuid}`}
                className="block" // Add block to make the link fill the container
              >
                <h2 className="text-lg font-medium mb-2">{result.name}</h2>
                <p className="text-gray-700">{result.description}</p>
                {/* Display other relevant quiz information here */}
              </Link>
            </li>
          ))}{" "}
        </ul>
      )}
    </div>
  );
}
