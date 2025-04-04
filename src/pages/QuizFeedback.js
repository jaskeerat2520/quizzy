import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
export default function QuizFeedback() {
  const { quizId } = useParams();
  const { submissionId } = useParams();
  const [questionSet, setQuestionSet] = useState([]);
  const [score, setScore] = useState(0);
  const [answersGiven, setAwnsersGiven] = useState([]);

  function handleAnswerClick(questionIndex, optionIndex) {
    const isCorrect = questionSet[questionIndex].correct_answer === optionIndex;

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
  }
  function submitQuiz() {}
  useEffect(() => {
    async function getQuizDocuments() {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId);

      if (error) {
        console.error("Error fetching questions:", error);
      } else {
        setQuestionSet(data || []);
      }
    }

    async function getUserAttempt() {
      const { data, error } = await supabase
        .from("awnsers")
        .select("*")
        .eq("submission_id", submissionId);
    }

    getUserAttempt();
    getQuizDocuments();
  }, [quizId]);

  return (
    <div>
      <h1>Quiz FeedBack</h1>

      <div className="space-y-6">
        {questionSet && questionSet.length > 0 ? (
          questionSet.map((question, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg shadow-md bg-white"
            >
              <h2 className="text-xl font-semibold text-gray-700">
                {index + 1}. {question.question_text}
              </h2>
              <ul className="ml-6 list-disc">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    onClick={() => handleAnswerClick(index, optionIndex)}
                    className={`border p-8 m-2 rounded-md ${
                      answersGiven[index] === optionIndex
                        ? "bg-blue-200"
                        : "bg-gray-100"
                    } hover:cursor-pointer`}
                  >
                    <h1>{option}</h1>
                  </div>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>Loading questions...</p>
        )}
      </div>
    </div>
  );
}
