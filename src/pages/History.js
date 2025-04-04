import { getQuizHistory } from "../services/documentService";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
export default function QuizHistory() {
  const params = useParams();
  const quizId = params.quizId;
  const userId = params.userId;

  useEffect(() => {
    async function getHistory() {
      const attempts = await getQuizHistory(quizId);
      console.log(attempts);
    }
    getHistory();
  }, []);
  return (
    <div>
      <h1>{userId}</h1>
      <h1>{quizId}</h1>
      <h1>quiz history</h1>
    </div>
  );
}
