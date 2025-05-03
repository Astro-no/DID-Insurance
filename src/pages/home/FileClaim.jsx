import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const FileClaim = () => {
  const { policyId } = useParams(); // Grabbing policyId from the URL (from policyregistrations table)
  const navigate = useNavigate();
  const { authenticatedUser, loading: authLoading } = useAuth(); // Get authenticated user and loading state
  const [description, setDescription] = useState("");
  const [selectedVC, setSelectedVC] = useState(null); // State for selected VC
  const [vcs, setVcs] = useState([]); // Store VCs fetched from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actualPolicyId, setActualPolicyId] = useState(null); // Store the actual policy ID from the policies collection
  const [claimAmount, setClaimAmount] = useState(""); // Add state for claim amount

  // Fetch the actual policy ID from the policyregistrations table
  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/policyregistrations/${policyId}`, {
          headers: authenticatedUser.token ? { Authorization: `Bearer ${authenticatedUser.token}` } : {},
        });

        const policy = response.data.policy;
        if (!policy) {
          setError("Policy not found. Please contact support.");
          return;
        }

        setActualPolicyId(policy._id); // Set the actual policy ID
      } catch (error) {
        console.error("Error fetching policy details:", error);
        setError("Failed to load policy details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (policyId) {
      fetchPolicyDetails();
    }
  }, [policyId, authenticatedUser]);

  // Check authentication status before making API calls
  useEffect(() => {
    // Wait for auth to complete loading
    if (authLoading) return;
    
    // Redirect to login if not authenticated
    if (!authenticatedUser) {
      console.log("No authenticated user found, redirecting to login");
      setError("Please log in to file a claim");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    
    // Make sure the user has a DID
    if (!authenticatedUser.did) {
      console.error("Authenticated user missing DID:", authenticatedUser);
      setError("Authentication error: User profile incomplete. Please contact support.");
      return;
    }

    // Fetch VCs if authenticated with valid DID
    const fetchVCs = async () => {
      try {
        console.log("Fetching VCs for authenticated user:", authenticatedUser.did);
        const response = await axios.get(
          `http://localhost:5000/api/vcs/${encodeURIComponent(authenticatedUser.did)}`,
          {
            headers: authenticatedUser.token
              ? { Authorization: `Bearer ${authenticatedUser.token}` }
              : {},
          }
        );

        console.log("Fetched VCs:", response.data.vcs);

        const processedVCs = response.data.vcs
          ? response.data.vcs.map((vcObj) => vcObj.vc || vcObj)
          : [];

        setVcs(processedVCs);

        if (processedVCs.length === 0) {
          setError(
            "No verifiable credentials found for your account. Please add credentials before filing a claim."
          );
        }
      } catch (error) {
        console.error("Error fetching VCs:", error);
        if (error.response?.status === 404) {
          setError("No VCs found for your DID.");
        } else {
          setError("Failed to load your verifiable credentials. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVCs();
  }, [authenticatedUser, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authenticatedUser || !authenticatedUser.did) {
      setError("Please log in again to file a claim");
      navigate("/login");
      return;
    }

    if (!description || !selectedVC || !claimAmount) {
      alert("Please fill in all fields, including the claim amount, and select a verifiable credential.");
      return;
    }

    if (!actualPolicyId) {
      alert("Policy details are not loaded yet. Please try again.");
      return;
    }

    const formData = {
      description,
      policyId: actualPolicyId, // Use the actual policy ID
      claimAmount, // Include the claim amount
      selectedVC,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/claims/file", formData, {
        headers: {
          "Content-Type": "application/json",
          ...(authenticatedUser.token ? { Authorization: `Bearer ${authenticatedUser.token}` } : {}),
        },
      });
      alert("Claim filed successfully!");
      navigate("/view-policies");
    } catch (err) {
      console.error("Error filing claim:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert("Error filing claim: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatProcedureName = (vc) => {
    const procedure = vc?.credentialSubject?.procedure;
    if (!procedure) return "Unknown Procedure";
    
    const date = procedure.timestamp ? 
      new Date(procedure.timestamp).toLocaleDateString() : 
      new Date(vc.issuanceDate).toLocaleDateString();
      
    return `${procedure.name || "Medical Procedure"} - ${date}`;
  };

  const saveVC = async (vc) => {
    try {
      const response = await axios.post("http://localhost:5000/api/vcs", { vc });
      console.log("VC saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving VC:", error);
    }
  };

  // Display loading state while auth is still loading
  if (authLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">File a Claim</h2>
      <p className="mb-4 text-gray-600">Policy ID: {policyId}</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!error && loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading your credentials...</p>
        </div>
      ) : !error && authenticatedUser ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-800">
              Authenticated as: <strong>{authenticatedUser.name}</strong>
            </p>
            <p className="text-sm text-green-700">DID: {authenticatedUser.did}</p>
          </div>
        
          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
              Claim Description
            </label>
            <textarea
              id="description"
              placeholder="Describe the incident or reason for your claim in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>
          
          <div>
            <label htmlFor="claimAmount" className="block text-lg font-medium text-gray-700 mb-2">
              Claim Amount
            </label>
            <input
              type="number"
              id="claimAmount"
              placeholder="Enter the claim amount"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="vcSelect" className="block text-lg font-medium text-gray-700 mb-2">
              Select a Verifiable Credential
            </label>
            <select
              id="vcSelect"
              onChange={(e) => {
                const selectedIndex = e.target.value;
                if (selectedIndex !== "") {
                  setSelectedVC(vcs[parseInt(selectedIndex)]);
                } else {
                  setSelectedVC(null);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Select a credential --</option>
              {vcs.map((vc, idx) => (
                <option key={idx} value={idx}>
                  {formatProcedureName(vc)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select the medical procedure or event related to this claim
            </p>
          </div>

          {selectedVC && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Selected Credential Details</h3>
              <p><strong>Procedure:</strong> {selectedVC?.credentialSubject?.procedure?.name || "N/A"}</p>
              <p><strong>Date:</strong> {
                selectedVC?.credentialSubject?.procedure?.timestamp ? 
                new Date(selectedVC.credentialSubject.procedure.timestamp).toLocaleString() : 
                "N/A"
              }</p>
              <p><strong>Issuer:</strong> {selectedVC?.issuer || "N/A"}</p>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition duration-200 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      ) : null}
    </div>
  );
};

export default FileClaim;