import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
// Initialize Supabase client
const supabase = createClient(
  "https://wepuwlxplxekuamljyzz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcHV3bHhwbHhla3VhbWxqeXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcxNTYsImV4cCI6MjA1NTQwMzE1Nn0.QaJ7oeae8KHSJx-QxO8BNg3-XhOjCD3KLtajTcfGhog",
);

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search function
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Perform search using Supabase's text search capabilities
      // Assuming you have a table called 'items' with a column called 'name'
      const { data, error } = await supabase
        .from("quizes")
        .select("*")

        .ilike("name", `%${query}%`)
        .limit(10);

      if (error) {
        console.error("Error performing search:", error);
        return;
      }
      console.log(data);
      setResults(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-4 py-2 pr-10 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
            Loading...
          </span>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
            Search Results
          </h3>
          <ul className="divide-y divide-gray-200">
            {results.map((item) => (
              <Link
                to={`/quiz/${item.uuid}`}
                key={item.id}
                className="p-4 hover:bg-gray-300 transition-colors duration-200"
              >
                <h4 className="text-base font-medium text-gray-700 hover:text-blue-600">
                  {item.name}
                </h4>
              </Link>
            ))}
          </ul>
        </div>
      )}

      <h1
        onClick={() => {
          window.location.href = `/search/${query}`; // Replace with your desired path
        }}
        className="bg-white"
      >
        See More
      </h1>
      {query && results.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-md p-4 text-center text-gray-600">
          No results found
        </div>
      )}
    </div>
  );
}
export default SearchBar;
