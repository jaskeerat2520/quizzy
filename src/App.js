import SignUp from "./pages/SignUp";
import LoggedInTopBar from "./components/LoggedInTopBar";
import "./App.css";
import QuizFeedback from "./pages/QuizFeedback";
import EditQuiz from "./pages/EditQuiz";
import TopBar from "./components/TopBar";
import UserDashboard from "./pages/UserDashboard";
import SubmissionReport from "./pages/Submission";
import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";
import Analytics from "./Analytics";
import SignIn from "./pages/SignIn";
import CreateQuiz from "./pages/CreateQuiz";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChoiceQuestions from "./pages/ChoiceQuestions";
import SideBar from "./components/SideBar";
import AllDocuments from "./pages/Documents";
import QuizHistory from "./pages/QuizHistory";
import Search from "./pages/Search";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export const supabaseClient = createClient(
  "https://wepuwlxplxekuamljyzz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcHV3bHhwbHhla3VhbWxqeXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcxNTYsImV4cCI6MjA1NTQwMzE1Nn0.QaJ7oeae8KHSJx-QxO8BNg3-XhOjCD3KLtajTcfGhog",
);
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);

  const ProtectedRoute = ({ children }) => {
    useEffect(() => {
      if (!isAuthenticated) {
        window.location.href = "/signin";
      }
    }, [isAuthenticated]); // Add isAuthenticated to the dependency array

    return isAuthenticated ? children : null;
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? <LoggedInTopBar /> : <TopBar />}

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/getstarted" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        <Route
          path="/search/:query"
          element={<ProtectedRoute>{<Search />}</ProtectedRoute>}
        />
        <Route
          path="/create"
          element={<ProtectedRoute>{<CreateQuiz />}</ProtectedRoute>}
        />
        <Route
          path="/Analytics"
          element={<ProtectedRoute>{<Analytics />}</ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute>{<UserDashboard />}</ProtectedRoute>}
        />
        <Route
          path="/documents"
          element={<ProtectedRoute>{<AllDocuments />}</ProtectedRoute>}
        />
        <Route
          path="/choice/feedback/:quizId/:submissionId"
          element={<ProtectedRoute>{<QuizFeedback />}</ProtectedRoute>}
        />
        <Route
          path="/History/:quizId"
          element={<ProtectedRoute>{<QuizHistory />}</ProtectedRoute>}
        />
        <Route
          path="/submission/:submissionId"
          element={<ProtectedRoute>{<SubmissionReport />}</ProtectedRoute>}
        />
        <Route
          path="/submission/history/:quidId"
          element={<ProtectedRoute>{<QuizHistory />}</ProtectedRoute>}
        />
        <Route
          path="/quiz/choice/:quizId"
          element={<ProtectedRoute>{<ChoiceQuestions />}</ProtectedRoute>}
        />
        <Route
          path="/editQuiz/:quizId"
          element={<ProtectedRoute>{<EditQuiz />}</ProtectedRoute>}
        />
        <Route
          path="/quiz/:quizId"
          element={<ProtectedRoute>{<QuizPage />}</ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
