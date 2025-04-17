import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const FileClaim = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !documents) {
      alert("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("documents", documents);
    formData.append("policyId", policyId);

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/claims/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Claim filed successfully!");
      navigate("/view-policies");
    } catch (err) {
      console.error(err);
      alert("Error filing claim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">File a Claim for Policy ID: {policyId}</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Describe the incident..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border mb-4"
          rows={4}
        />
        <input
          type="file"
          onChange={(e) => setDocuments(e.target.files[0])}
          className="mb-4"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
};

export default FileClaim;
