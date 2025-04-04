import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserId } from "../supabaseClient";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ChoiceQuestions() {
  const { quizId } = useParams();
  const userId = getUserId();
  const [questionSet, setQuestionSet] = useState([]);
  const [answersGiven, setAnswersGiven] = useState([]);
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const navigate = useNavigate();
  function handleAnswerClick(questionIndex, optionIndex) {
    const updatedAnswers = [...answersGiven];
    updatedAnswers[questionIndex] = optionIndex;
    setAnswersGiven(updatedAnswers);
  }

  async function submitQuiz() {
    if (quizSubmitted) return;

    let calculatedScore = 0;
    for (let i = 0; i < answersGiven.length; i++) {
      if (questionSet[i] && questionSet[i].correct_answer === answersGiven[i]) {
        calculatedScore++;
      }
    }
    setScore(calculatedScore);
    console.log(calculatedScore);
    const submission = await quizSubmission(
      calculatedScore,
      questionSet,
      userId,
    );
    console.log(submission);
    setQuizSubmitted(true);
  }

  async function quizSubmission(score, questionSet, userId) {
    if (!questionSet || questionSet.length === 0) {
      console.error(
        "Error: Cannot calculate grade because questionSet is empty.",
      );
      return;
    }

    const grade = (score / questionSet.length) * 100;
    const id = await getUserId();

    const { data, error } = await supabase
      .from("quiz_history")
      .insert({ user_id: id, grade: grade, quiz_id: quizId })
      .select("submission_id");

    if (error) {
      console.error("Error inserting quiz submission:", error);
      return;
    }

    const submissionId = data[0].submission_id;

    const transformedData = answersGiven.map((item, count) => ({
      question_id: questionSet[count].id,
      quiz_id: quizId,
      given_awnser: item,
      submission_id: submissionId,
    }));

    console.log(transformedData);
    const { error: answersError } = await supabase
      .from("answers")
      .insert(transformedData);

    if (answersError) {
      console.error("Error inserting answers:", answersError);
    }

    console.log("Quiz submission successful:", data);
    navigate(`/submission/${data[0].submission_id}`);
  }

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
        setAnswersGiven(Array(data.length).fill(null));
      }
    }

    getQuizDocuments();
  }, [quizId]);

  return (
    <div className="container mx-auto p-4">
      <div>
        <h1></h1>
      </div>
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
      {!quizSubmitted && (
        <button
          onClick={() => submitQuiz()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      )}{" "}
      <Link to="#" onClick={() => window.history.goBack()}>
        Go Back
      </Link>
    </div>
  );
}
