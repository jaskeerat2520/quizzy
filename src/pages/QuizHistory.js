import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useParams } from "react-router-dom";
import { getUserId } from "../supabaseClient";
import SideBar from "../components/SideBar"; // Import the SideBar component

export default function QuizHistory() {
  const { quizId } = useParams();
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    async function fetchUserId() {
      const id = await getUserId();
      setCurrentUserId(id);
    }

    fetchUserId();
  }, []);

  useEffect(() => {
    async function getPreviousResults() {
      setLoading(true);

      if (currentUserId) {
        const { data: historyData, error: historyError } = await supabase
          .from("quiz_history")
          .select("*")
          .eq("quiz_id", quizId)
          .eq("user_id", currentUserId);

        if (historyError) {
          console.error("Error fetching quiz history:", historyError);
        } else {
          setQuizHistory(historyData || []);
        }
      }

      const { data: quizData, error: quizError } = await supabase
        .from("quizes")
        .select("name")
        .eq("uuid", quizId)
        .single();

      if (quizError) {
        console.error("Error fetching quiz name:", quizError);
      } else if (quizData) {
        setQuizName(quizData.name);
      }

      setLoading(false);
    }

    if (currentUserId) {
      getPreviousResults();
    }
  }, [quizId, currentUserId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SideBar />
        </div>

        <div className="md:col-span-3">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {quizName ? `${quizName} History` : "Quiz History"}
          </h1>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("history")}
                className={`${
                  activeTab === "history"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Quiz Attempts
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "history" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                      Your {quizName || "This Quiz"} Quiz Attempts
                    </h2>
                    <div className="text-sm text-gray-500">
                      {quizHistory.length}{" "}
                      {quizHistory.length === 1 ? "attempt" : "attempts"} total
                    </div>
                  </div>

                  {quizHistory.length > 0 ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {quizHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(item.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    item.score >= 80
                                      ? "bg-green-100 text-green-800"
                                      : item.score >= 60
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {item.score || 0}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                  href={`/submission/${item.submission_id}`}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  View Details
                                </a>
                                <a
                                  href={`/quiz/${quizId}`}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Retry Quiz
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                      <div className="text-gray-500 mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        No attempts found for "{quizName || "this quiz"}" by you
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You haven't completed this quiz yet.
                      </p>
                      <div className="mt-6">
                        <Link
                          to={`/quiz/${quizId}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Take This Quiz
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
