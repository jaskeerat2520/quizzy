import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getQuizDetails,
  getSubmissionAnswers,
  getSubmissionFromUser,
} from "../services/documentService";
import SideBar from "../components/SideBar"; // Make sure this path is correct

export default function SubmissionReport() {
  const { submissionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [submissionData, setSubmissionData] = useState(null);
  const [questionAnswerMap, setQuestionAnswerMap] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSubmissionFromUser(submissionId);
        setSubmissionData(data);
        console.log("Quiz ID from data:", data.quiz_id);
        setQuizId(data.quiz_id);

        const answers = await getSubmissionAnswers(submissionId);
        console.log("User answers:", answers);
        setUserAnswers(answers);

        // Create a map of question ID to user's answer
        const answerMap = {};
        answers.forEach((answer) => {
          answerMap[answer.question_id] = answer.selected_option;
        });
        setQuestionAnswerMap(answerMap);
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      }
    }

    if (submissionId) {
      fetchData();
    }
  }, [submissionId]);

  useEffect(() => {
    async function fetchQuizDetails() {
      try {
        console.log("Fetching quiz details for ID:", quizId);
        const quizQuestions = await getQuizDetails(quizId);
        console.log("Quiz questions:", quizQuestions);

        setQuestions(quizQuestions || []);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    }

    if (quizId) {
      fetchQuizDetails();
    } else {
      console.log("Quiz ID not available yet, skipping details fetch");
    }
  }, [quizId]);

  // Calculate score
  const calculateScore = () => {
    if (questions.length === 0 || Object.keys(questionAnswerMap).length === 0)
      return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    questions.forEach((question) => {
      const userAnswer = questionAnswerMap[question.id];
      if (userAnswer === question.correct_answer) {
        correct++;
      }
    });

    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const score = calculateScore();

  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1 p-4 ml-64">
        <h1 className="text-2xl font-bold mb-6">Submission Report</h1>
        {submissionData ? (
          <div>
            <div className="bg-gray-100 p-4 rounded mb-6">
              <p className="font-medium">Quiz ID: {quizId}</p>
              <p className="font-medium">Total Questions: {questions.length}</p>
              <p className="font-medium">User Answers: {userAnswers.length}</p>
              <p className="font-medium">
                Score: {score.correct}/{score.total} ({score.percentage}%)
              </p>
            </div>

            {questions.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Questions & Answers</h2>
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const userAnswer = questionAnswerMap[question.id];
                    const isCorrect = userAnswer === question.correct_answer;

                    return (
                      <div
                        key={question.id}
                        className="p-4 border rounded shadow"
                      >
                        <p className="font-medium mb-2">
                          Question {index + 1}: {question.question_text}
                        </p>
                        <ol className="list-decimal ml-6 mt-2">
                          {question.options.map((option, optionIndex) => (
                            <li
                              key={optionIndex}
                              className={`
                                ${optionIndex === question.correct_answer ? "text-green-600" : ""} 
                                ${userAnswer === optionIndex ? (isCorrect ? "font-bold" : "text-red-600 font-bold") : ""}
                              `}
                            >
                              {option}
                              {optionIndex === question.correct_answer &&
                                " (Correct)"}
                              {userAnswer === optionIndex &&
                                userAnswer !== question.correct_answer &&
                                " (Your Answer)"}
                            </li>
                          ))}
                        </ol>
                        <div className="mt-2">
                          {isCorrect ? (
                            <p className="text-green-600">✓ Correct</p>
                          ) : (
                            <p className="text-red-600">✗ Incorrect</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Loading submission data...</p>
        )}
      </div>
    </div>
  );
}
