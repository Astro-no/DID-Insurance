import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

const MyClaims = () => {
  const { authenticatedUser, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const statusConfig = {
    Approved: {
      icon: <CheckCircle className="text-green-600 mr-2" />,
      labelClass: "text-green-700 bg-green-100",
    },
    Pending: {
      icon: <Clock className="text-yellow-600 mr-2" />,
      labelClass: "text-yellow-700 bg-yellow-100",
    },
    Rejected: {
      icon: <XCircle className="text-red-600 mr-2" />,
      labelClass: "text-red-700 bg-red-100",
    },
  };

  useEffect(() => {
    const fetchClaims = async () => {
      if (!authenticatedUser?.did) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/claims/by-did/${encodeURIComponent(authenticatedUser.did)}`,
          {
            headers: {
              Authorization: `Bearer ${authenticatedUser.token}`,
            },
          }
        );
        setClaims(response.data.claims || []);
      } catch (err) {
        console.error("Error fetching claims:", err.response?.data || err.message);
        setError("Failed to fetch your claims.");
      }
    };

    if (!authLoading && authenticatedUser) {
      fetchClaims();
    }
  }, [authenticatedUser, authLoading]);

  useEffect(() => {
    if (filter === "All") {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(
        claims.filter((c) => c.status.toLowerCase() === filter.toLowerCase())
      );
    }
  }, [filter, claims]);

  const formatDate = (iso) => new Date(iso).toLocaleString();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
        <p className="ml-2">Loading your claims...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📄 My Claims</h1>

      {error && (
        <div className="text-red-700 bg-red-100 p-4 mb-4 rounded">
          {error}
        </div>
      )}

      {/* Filter Dropdown */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mr-2">Filter by Status:</label>
        <select
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <p className="text-gray-500">No claims found under this filter.</p>
      ) : (
        <ul className="space-y-4">
          {filteredClaims.map((claim) => (
            <li
              key={claim._id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {statusConfig[claim.status]?.icon}
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${statusConfig[claim.status]?.labelClass}`}
                  >
                    {claim.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(claim.createdAt)}</span>
              </div>

              <p className="text-gray-800 font-medium">
                📝 <strong>Description:</strong> {claim.description}
              </p>
              <p className="text-gray-600">
                💰 <strong>Amount:</strong> KES {claim.claimAmount}
              </p>
              {claim.hospitalName && (
                <p className="text-gray-600">
                  🏥 <strong>Hospital:</strong> {claim.hospitalName}
                </p>
              )}
              {claim.procedureId && (
                <p className="text-gray-500 text-sm mt-1">
                  🔍 <strong>Procedure VC:</strong> {claim.procedureId}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyClaims;
