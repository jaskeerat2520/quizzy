import { useState, useEffect } from "react";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import PDFUpload from "../components/PDFUpload.js";
import { getUserDocuments } from "../services/documentService.js";
import SideBar from "../components/SideBar.js";

export default function CreateQuiz() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const getDocuments = async () => {
      try {
        const documents = await getUserDocuments();
        setDocuments(documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    getDocuments();
  }, []);

  return (
    <Grid container sx={{ minHeight: "100vh", backgroundColor: "#2f343a" }}>
      <Grid
        item
        xs={12}
        sm={3}
        md={2}
        sx={{ backgroundColor: "#1a1d23", color: "white" }}
      >
        <SideBar />
      </Grid>

      <Grid
        item
        xs={12}
        sm={9}
        md={10}
        sx={{ p: 4, backgroundColor: "#343a40" }}
      >
        <Typography variant="h4" color="white" gutterBottom>
          Create your quizzes
        </Typography>
        <PDFUpload />

        <Box mt={4}>
          <Typography variant="h5" color="white" gutterBottom>
            Your Documents
          </Typography>
          {documents.length > 0 ? (
            <Grid container spacing={2}>
              {documents.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card
                    sx={{
                      backgroundColor: "#444",
                      color: "white",
                      borderRadius: "10px",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {doc.name}
                        </Typography>
                        <Typography variant="body2" color="#ccc">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="body2" color="#ccc">
                          Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        <Typography variant="body2" color="#ccc">
                          Status: {doc.status}
                        </Typography>
                        <Typography variant="body2" color="#ccc">
                          Type: {doc.mime_type}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="white">
              No documents uploaded yet
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
