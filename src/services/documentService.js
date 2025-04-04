import { getUserId, supabase } from "../supabaseClient";

export const documentService = {
  async uploadDocument(file) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const fileExt = file.name.split(".").pop();
      const uniqueId = Math.random().toString(36).substring(2);
      const filePath = `${user.id}/${uniqueId}.${fileExt}`;

      //chcek the next available number for the supabase. So the next folder created in supabase will be have a name that is a number that goes up one

      // Store in database
      const { error: dbError } = await supabase.from("documents").insert({
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        user_id: user.id,
        status: "uploaded",
      });

      if (dbError) throw dbError;

      return { success: true };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },
};
export async function getUserDocuments() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getHighestFolderNumber() {
  const { data, error } = await supabase.storage.from("Documents").list();

  if (error) throw error;

  const nextFolderName = data.length - 1;
  return nextFolderName;
}

export async function getUserQuizes() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("quizes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    console.log(data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getQuizDocuments(quizId) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    console.log(data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getQuizName(quizId) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("quizes")
      .select("**")
      .eq("uuid", quizId);

    if (error) throw error;
    console.log(data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
export async function editQuizDocuments(quizId, file) {}

export async function removeDocumentFromQuiz(fileId) {
  try {
    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("id", fileId);
  } catch (error) {
    console.log(error);
  }
}
export async function createQuiz(quizId) {
  try {
    const response = await fetch(
      "https://wepuwlxplxekuamljyzz.supabase.co/functions/v1/analyze-documents",
    );
  } catch (error) {
    console.error("fetch error");
    throw error;
  }
}

export async function removeQuiz(quizId) {
  try {
    // First, delete the quiz history related to the quiz
    const { data: quizHistoryData, error: quizHistoryError } = await supabase
      .from("quiz_history")
      .delete()
      .eq("quiz_id", quizId);

    if (quizHistoryError) {
      console.error("Supabase error deleting quiz history:", quizHistoryError);
      return { error: quizHistoryError };
    }

    // Next, delete the answers related to the quiz
    const { data: answersData, error: answersError } = await supabase
      .from("answers")
      .delete()
      .eq("quiz_id", quizId);

    if (answersError) {
      console.error("Supabase error deleting answers:", answersError);
      return { error: answersError };
    }

    // Then, delete the related documents
    const { data: docsData, error: docsError } = await supabase
      .from("documents")
      .delete()
      .eq("quiz_id", quizId);

    if (docsError) {
      console.error("Supabase error deleting documents:", docsError);
      return { error: docsError };
    }

    // Then, delete the related questions
    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .delete()
      .eq("quiz_id", quizId);

    if (questionError) {
      console.error("Supabase error deleting questions:", questionError);
      return { error: questionError };
    }

    // Finally, delete the quiz
    const { data: quizData, error: quizError } = await supabase
      .from("quizes")
      .delete()
      .eq("uuid", quizId)
      .select();

    if (quizError) {
      console.error("Supabase error deleting quiz:", quizError);
      return { error: quizError };
    }

    return { data: quizData }; // Return the deleted quiz data (optional)
  } catch (error) {
    console.error(
      "An unexpected error occurred while removing the quiz:",
      error,
    );
    return { error: error.message };
  }
}
export async function getQuizHistory(quizId) {
  const user = await getUserId();
  try {
    const { data, error } = await supabase
      .from("quiz_history")
      .select()
      .eq("user_id", user)
      .gt("quiz_id", quizId);
    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function getDocumentLink(quizId, docId) {
  try {
    const { data: documentDbData, error: documentDbError } = await supabase
      .from("documents")
      .select()
      .eq("id", docId)
      .single();

    if (documentDbError) throw documentDbError;
    console.log("Document data:", documentDbData);

    // Check if file_path exists
    if (!documentDbData.file_path) {
      console.error("No file path found for document");
      return null;
    }

    const filePath = documentDbData.file_path;

    // Get the public URL
    const { data, error } = await supabase.storage
      .from("Documents")
      .getPublicUrl(filePath);

    if (error) throw error;

    // Log the entire data object to see its structure
    console.log("Full response from getPublicUrl:", data);

    // Check the structure of the response
    if (data && data.publicUrl) {
      console.log("Public URL:", data.publicUrl);
      return data.publicUrl;
    } else if (data && typeof data === "object") {
      // For different versions of Supabase, the structure might vary
      const url = data.signedUrl || data.url || Object.values(data)[0];
      console.log("Found URL:", url);
      return url;
    } else {
      throw new Error("Unexpected response structure from getPublicUrl");
    }
  } catch (error) {
    console.error("Error retrieving public URL:", error);
    return null;
  }
}

export async function getSubmissionFromUser(submissionId) {
  try {
    const { data, error } = await supabase
      .from("quiz_history")
      .select()
      .eq("submission_id", submissionId);

    if (error) {
      console.error("Error fetching submission:", error);
      throw error;
    }

    return data[0]; // Return the first item if it's a single record
  } catch (error) {
    console.error("Submission fetch error:", error);
    throw error;
  }
}

export async function getSubmissionAnswers(submissionId) {
  try {
    const { data, error } = await supabase
      .from("answers")
      .select("**")
      .eq("submission_id", submissionId);

    if (error) {
      console.error("Error fetching answers:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Answers fetch error:", error);
    throw error;
  }
}

export async function getQuizDetails(quizId) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);

    if (error) {
      console.error("Error fetching quiz details:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Quiz details fetch error:", error);
    throw error;
  }
}
