import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserQuizes, removeQuiz } from "../services/documentService";
import { getUserId } from "../supabaseClient";
import SideBar from "../components/SideBar";

export default function UserDashboard() {
  const [allQuizes, setAllQuizes] = useState([]);
  const [userId, setUserId] = useState("");
  useEffect(() => {
    async function getCurrentUserQuizList() {
      const quizes = await getUserQuizes();
      setAllQuizes(quizes);
      console.log(quizes);
    }
    async function getId() {
      setUserId(await getUserId());
    }

    getId();
    getCurrentUserQuizList();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <SideBar />
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            User Dashboard
          </h1>
          <Link
            to={`/submission/history/${userId}`}
            className="text-blue-500 hover:underline mb-4 block"
          >
            Previous submissions
          </Link>
          <QuizList quizes={allQuizes} />
        </div>
      </div>
    </div>
  );
}

const QuizList = ({ quizes }) => {
  async function deleteQuiz(quizId) {
    const result = await removeQuiz(quizId);

    if (result.error) {
      console.error("Error deleting quiz:", result.error);
      alert("Failed to delete quiz. See console for details.");
    } else {
      console.log("Quiz deleted successfully:", result.data);
    }
  }

  if (!quizes || quizes.length === 0) {
    return (
      <div className="bg-white rounded-md shadow p-6 text-center">
        <p className="text-lg text-gray-600 mb-4">
          No quizzes available yet. Create your first quiz!
        </p>
        <Link
          to="/create"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
        >
          Create a New Quiz
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Your Quizzes
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {quizes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-md shadow p-5 border border-gray-200 hover:shadow-md transition duration-200"
          >
            <div className="flex justify-between items-center">
              <div className="flex-grow">
                <Link
                  to={`/quiz/${quiz.uuid}`}
                  className="block hover:underline"
                >
                  <h3 className="text-xl font-semibold text-gray-700">
                    {quiz.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  📅 Created: {new Date(quiz.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  👤 User ID: {quiz.user_id}
                </p>
              </div>
              <div className="space-x-2">
                <Link
                  to={`/editquiz/${quiz.uuid}`}
                  className="inline-flex items-center bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md transition duration-300 text-sm"
                >
                  ✏️ Edit
                </Link>
                <Link
                  to={`/history/${quiz.uuid}`}
                  className="inline-flex items-center bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition duration-300 text-sm"
                >
                  📊 History
                </Link>
                <button
                  onClick={() => deleteQuiz(quiz.uuid)}
                  className="inline-flex items-center bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md transition duration-300 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/create"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-300"
        >
          ➕ Create a New Quiz
        </Link>
      </div>
    </div>
  );
};
