import QuizPage from "./QuizPage.js";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SideBar from "../components/SideBar.js";
import PDFUpload from "../components/PDFUpload.js";
import PDFEdits from "../components/PDFEdits.js";
import {
  getQuizName,
  getQuizDocuments,
  removeDocumentFromQuiz,
} from "../services/documentService.js";

export default function EditQuiz() {
  const [documents, setDocuments] = useState([]);
  const [quizName, setQuizName] = useState("");
  const { quizId } = useParams();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const quizDetails = await getQuizName(quizId);
        if (quizDetails.length > 0) {
          setQuizName(quizDetails[0].name);
        }
      } catch (error) {
        console.error("Error fetching quiz name:", error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const docs = await getQuizDocuments(quizId);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchQuizDetails();
    fetchDocuments();
  }, [quizId]);

  async function removeDocument(fileId) {
    try {
      const removeFile = await removeDocumentFromQuiz(fileId);
      window.location.reload();
      console.log(removeFile);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-4">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Edit {quizName}
          </h1>

          <PDFEdits />

          <Link
            to={`/quiz/${quizId}`}
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Go to Quiz
          </Link>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Your Documents
            </h2>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-blue-50 rounded-lg shadow-sm p-4"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {doc.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      Created: {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      Status: {doc.status}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      Type: {doc.mime_type}
                    </p>
                    <div className="flex justify-end">
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">
                        View
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No documents uploaded yet.</p>
            )}
          </div>

          <div className="mt-8">
            <QuizPage />
          </div>
        </div>
      </div>
    </div>
  );
}
