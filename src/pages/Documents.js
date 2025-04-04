import { useEffect, useState } from "react";
import { getUserDocuments, getDocumentLink } from "../services/documentService";
import SideBar from "../components/SideBar";
export default function AllDocuments() {
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getAllDocuments() {
      try {
        setLoading(true);
        const documents = await getUserDocuments();
        setAllDocuments(documents);
        setError(null);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    }
    getAllDocuments();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center my-6">All Documents</h1>

      {loading && (
        <div className="text-center py-8">
          <p>Loading documents...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      )}

      <DocumentGrid documents={allDocuments} />
    </div>
  );
}

const DocumentGrid = ({ documents = [] }) => {
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [documentError, setDocumentError] = useState(null);

  async function handleDocumentSelect(doc) {
    try {
      setLoadingDocId(doc.id);
      setDocumentError(null);
      console.log("Selected document:", doc);

      const docUrl = await getDocumentLink(doc.quiz_id, doc.id);

      if (!docUrl) {
        throw new Error("Could not retrieve document URL");
      }

      console.log("Document URL:", docUrl);

      // Open the document URL in a new tab
      window.open(docUrl, "_blank");
    } catch (err) {
      console.error("Error retrieving document URL:", err);
      setDocumentError(`Failed to load document: ${err.message}`);
    } finally {
      setLoadingDocId(null);
    }
  }

  return (
    <div className="flex">
      <SideBar className="flex-shrink-0" />
      <div className="flex-grow p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Document Library</h2>
        {documentError && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
            {documentError}
          </div>
        )}
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-white"
                onClick={() => handleDocumentSelect(doc)}
              >
                <div className="flex items-center justify-center h-32 bg-gray-100 mb-2 relative">
                  {loadingDocId === doc.id ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-sm truncate">{doc.name}</h3>
                <p className="text-sm text-gray-500 truncate">
                  {new Date(doc.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
