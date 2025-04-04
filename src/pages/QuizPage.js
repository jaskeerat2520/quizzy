import { Buffer } from "buffer";
import { useParams, Link } from "react-router-dom";
import { getQuizDocuments } from "../services/documentService";
import React, { useState, useEffect } from "react";
import { Anthropic } from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import SideBar from "../components/SideBar";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
  dangerouslyAllowBrowser: true,
});

function QuizPage() {
  const [documents, setDocuments] = useState([]);
  const [documentUrls, setDocumentUrls] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const { quizId } = useParams();

  useEffect(() => {
    async function fetchDocuments() {
      setIsLoading(true);
      try {
        const response = await getQuizDocuments(quizId);
        setDocuments(response);

        if (response && response.length > 0) {
          const urls = response.map((file) => {
            const { data } = supabase.storage
              .from("Documents")
              .getPublicUrl(file.name);
            return {
              name: file.name,
              url: data.publicUrl,
            };
          });

          setDocumentUrls(urls);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [quizId]);

  async function saveQuiz(questionsToSave) {
    setSaveStatus("Saving quiz...");
    try {
      const limitedQuestions = questionsToSave.slice(0, questionCount);

      const transformedData = limitedQuestions.map((item) => ({
        question_text: item.questionText,
        quiz_id: quizId,
        options: item.options,
        correct_answer: item.correctAnswer,
      }));

      const { error: deletePreviousError } = await supabase
        .from("questions")
        .delete()
        .eq("quiz_id", quizId);

      if (deletePreviousError) {
        console.error(
          "Error deleting previous questions:",
          deletePreviousError,
        );
        setSaveStatus("Error: Failed to delete previous questions");
        return false;
      }

      const { data, error } = await supabase
        .from("questions")
        .insert(transformedData);

      if (error) {
        console.error("Error saving questions:", error);
        setSaveStatus("Error: Failed to save questions");
        return false;
      }

      setSaveStatus(
        `Quiz saved successfully with ${limitedQuestions.length} questions!`,
      );
      return true;
    } catch (error) {
      console.error("Error in saveQuiz function:", error);
      setSaveStatus("Error: Something went wrong while saving");
      return false;
    }
  }

  const analyzeAllDocuments = async () => {
    if (documentUrls.length === 0) {
      alert("No documents available to analyze");
      return;
    }

    setIsLoading(true);
    setQuestions([]);
    setSaveStatus("");

    try {
      let allQuestions = [];

      for (let i = 0; i < documentUrls.length; i++) {
        const doc = documentUrls[i];
        setProgress(Math.round((i / documentUrls.length) * 100));

        const docQuestions = await analyzeDocument(doc.url, doc.name);
        allQuestions = [...allQuestions, ...docQuestions];

        setQuestions(allQuestions);
      }

      setProgress(100);

      if (allQuestions.length > 0) {
        if (allQuestions.length > questionCount) {
          allQuestions = shuffleArray(allQuestions);
        }

        const saved = await saveQuiz(allQuestions);
        if (!saved) {
          console.error("Failed to auto-save quiz");
        }
      }
    } catch (error) {
      console.error("Error analyzing documents:", error);
      setSaveStatus("Error during document analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const analyzeDocument = async (url, documentName) => {
    try {
      const response = await fetch(url);
      const pdfBuffer = await response.arrayBuffer();
      const base64PDF = Buffer.from(pdfBuffer).toString("base64");

      const claudeResponse = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this document (${documentName}) and generate multiple choice questions that test understanding of key concepts, important details, and main themes from the document.

For each question:
1. Focus on substantive information from the document
2. Create challenging but fair questions
3. Include 4 options with only one correct answer
4. Make incorrect options plausible but clearly wrong when compared to the document
5. Ensure the correct answer is directly supported by the document text
6. If the document contains numerical data, formulas, or mathematical concepts, include at least 1-2 calculation-based questions that require applying mathematical reasoning

IMPORTANT: Return your response in valid JSON format following exactly this structure, with no additional text before or after the JSON:
[
  {
    "questionText": "Question that tests understanding of a key concept or important detail",
    "options": ["Correct option", "Plausible wrong option", "Plausible wrong option", "Plausible wrong option"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct, with reference to the document",
    "documentSource": "${documentName}"
  },
  ...more questions
]`,
              },
            ],
          },
        ],
      });
      const responseText = claudeResponse.content[0].text;
      console.log(`Raw Claude response for ${documentName}:`, responseText);

      try {
        const jsonMatch = responseText.match(/\[\s*{[\s\S]*}\s*\]/);

        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          const questionsArray = JSON.parse(extractedJson);

          return questionsArray.map((q) => ({
            ...q,
            documentSource: q.documentSource || documentName,
          }));
        } else {
          const manualQuestions = extractQuestionsManually(
            responseText,
            documentName,
          );
          console.log(manualQuestions);
          return manualQuestions;
        }
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        const manualQuestions = extractQuestionsManually(
          responseText,
          documentName,
        );
        console.log(manualQuestions);
        return manualQuestions;
      }
    } catch (error) {
      console.error(`Error analyzing document ${documentName}:`, error);
      return [];
    }
  };

  const extractQuestionsManually = (text, documentName) => {
    const questions = [];

    const questionBlocks = text
      .split(/\d+\.\s+/)
      .filter((block) => block.trim().length > 0);

    questionBlocks.forEach((block) => {
      const lines = block.split("\n").filter((line) => line.trim().length > 0);

      if (lines.length > 0) {
        const questionText = lines[0].trim();
        const options = [];
        let correctAnswer = null;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (/^[A-D][.):]\s+/.test(line)) {
            const option = line.replace(/^[A-D][.):]\s+/, "").trim();
            options.push(option);

            if (
              line.toLowerCase().includes("correct") ||
              line.toLowerCase().includes("✓")
            ) {
              correctAnswer = options.length - 1;
            }
          }
        }

        questions.push({
          questionText,
          options,
          correctAnswer,
          documentSource: documentName,
        });
      }
    });

    return questions;
  };

  return (
    <div className="flex mx-auto p-6 max-w-5xl">
      <div className="flex-1 bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Quiz Generator
        </h1>

        <Link
          className="border p-4 m-2 rounded-md bg-gray-50 mb-4 block"
          to={`/quiz/choice/${quizId}`}
        >
          multiple choice
        </Link>

        <Link
          className="border p-4 m-2 rounded-md bg-gray-50 mb-4 block"
          to={`/editquiz/${quizId}`}
        >
          Edit
        </Link>
        {isLoading && documents.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading documents...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Available Documents ({documents.length})
              </h2>
              {documents.length > 0 ? (
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <ul className="divide-y divide-gray-200">
                    {documentUrls.map((doc, idx) => (
                      <li key={idx} className="py-2">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{doc.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-600">
                  No documents found for this quiz.
                </p>
              )}

              <div className="flex flex-col mb-4">
                <label
                  htmlFor="questionCount"
                  className="mb-2 text-gray-700 font-medium"
                >
                  Number of Questions:
                </label>
                <div className="flex items-center">
                  <input
                    id="questionCount"
                    type="number"
                    min="1"
                    max="100"
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 mr-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">questions</span>
                </div>
              </div>

              <button
                onClick={analyzeAllDocuments}
                disabled={isLoading || documents.length === 0}
                className={`w-full py-3 px-4 rounded-md text-white font-medium
                ${
                  isLoading || documents.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading
                  ? `Analyzing Documents (${progress}%)`
                  : `Generate & Save ${questionCount} Questions`}
              </button>

              {saveStatus && (
                <div
                  className={`mt-2 p-2 rounded-md text-center ${saveStatus.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                >
                  {saveStatus}
                </div>
              )}
            </div>

            {isLoading && progress > 0 && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Processing documents... {progress}% complete
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default QuizPage;
