import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { getHighestFolderNumber } from "../services/documentService";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const currentUserID = "32b02097-2824-44fa-9b14-9d4a9c81f11a";

export default function PDFUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [quizName, setQuizName] = useState();
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    if (e.target.files) {
      const pdfFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf",
      );
      setFiles([...files, ...pdfFiles]);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const uploadFiles = async () => {
    let lastQuizId = null; // Define outside the loop to use later

    try {
      setUploading(true);
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const newFolderNumber = await getHighestFolderNumber();

        // Upload to storage
        const { data: quizData, error: quizError } = await supabase
          .from("quizes")
          .insert({
            name: quizName,
            user_id: currentUserID,
          })
          .select("uuid");

        console.log(quizData[0].uuid);
        const quiz_id = quizData[0].uuid;
        lastQuizId = quiz_id; // Store the ID for later use

        const filePath = `${quiz_id}/${fileName}`;
        const { error: uploaderror } = await supabase.storage
          .from("Documents")
          .upload(filePath, file);

        if (uploaderror) {
          throw uploaderror;
        }

        // Only insert into database if upload succeeded
        const { data: documentData, error: dbError } = await supabase
          .from("documents")
          .insert({
            user_id: currentUserID,
            name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            status: "completed",
            quiz_id: quiz_id,
          })
          .select("quiz_id");

        console.log(documentData);
        if (dbError) {
          console.error("Database error:", dbError);
          throw dbError;
        }
      }

      setFiles([]);
      alert("Files uploaded successfully!");

      // Use the stored quiz ID for navigation
      navigate(`/editquiz/${lastQuizId}`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading files: " + error.message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-white mb-2">Add Quiz Name</h2>
      <input
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
        className="text-black border border-yellow-400 border-4 rounded-md p-2 mb-4"
      />

      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
           file:mr-4 file:py-2 file:px-4
           file:rounded-full file:border-0
           file:text-sm file:font-semibold
           file:bg-blue-50 file:text-blue-700
           hover:file:bg-blue-100"
          disabled={uploading}
        />
      </div>
      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="truncate">{file.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:text-red-700"
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={uploadFiles}
        disabled={uploading || files.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded
         hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? `Uploading ${files.length} file(s)...` : "Upload Files"}
      </button>
    </div>
  );
}
