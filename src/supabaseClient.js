import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize hhupabase client

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
const currentUserID = "32b02097-2824-44fa-9b14-9d4a9c81f11a";
export default function PDFUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      // Filter for PDF files only
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
    try {
      setUploading(true);

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`; // Random filename
        const filePath = `pdfs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("your-bucket-name")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }
      }

      // Clear files after successful upload
      setFiles([]);
      alert("Files uploaded successfully!");
    } catch (error) {
      alert("Error uploading files: " + error.message);
    } finally {
      setUploading(false);
    }
  };
}

export async function SignInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function getUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  console.log("User ID:", user.id); // Access the user's unique ID
  return user.id;
}
