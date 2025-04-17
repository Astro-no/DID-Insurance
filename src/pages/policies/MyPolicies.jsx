import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyPolicies = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // To filter active or expired policies
  const [autoRenewSuggestions, setAutoRenewSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPolicies = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your policies");
          setLoading(false);
          return;
        }
  
        const response = await axios.get('http://localhost:5000/api/policies/my-policies', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { status: filter === 'all' ? undefined : filter } // Filter by active or expired
        });
        console.log('API Response:', response.data); // Log the response for debugging
        if (Array.isArray(response.data.registrations)) {
        setRegistrations(response.data.registrations);}
        else {
          setError("Unexpected response format");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user policies:", error);
        setError("Failed to load your policies. Please try again later.");
        setLoading(false);
      }
    };

    fetchMyPolicies();
  }, [filter]); // Dependency array added to re-fetch policies when filter changes

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if policy is expired
  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  // Suggest auto-renew if the policy is about to expire within 30 days
  const checkAutoRenew = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = Math.abs(expiry - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert time difference to days
    return diffDays <= 30 && !isExpired(expiryDate); // Suggest auto-renew if expiration is within 30 days
  };

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Navigate to login page after logout
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Policies</h2>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* Filters for active and expired policies */}
      <div className="mb-6">
        <button 
          onClick={() => setFilter("all")} 
          className={`px-4 py-2 mr-4 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          All Policies
        </button>
        <button 
          onClick={() => setFilter("active")} 
          className={`px-4 py-2 mr-4 rounded-lg ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Active Policies
        </button>
        <button 
          onClick={() => setFilter("expired")} 
          className={`px-4 py-2 mr-4 rounded-lg ${filter === 'expired' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Expired Policies
        </button>
      </div>
      
      {registrations.length === 0 ? (
        <div className="bg-blue-50 text-blue-800 p-6 rounded-lg text-center">
          <p className="mb-4">You haven't registered for any policies yet.</p>
          <a 
            href="/view-policies" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Available Policies
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {registrations.map((registration) => (
            <div 
              key={registration._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                isExpired(registration.expiryDate) ? 'border-red-500' : 'border-green-500'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{registration.policy.policyName}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isExpired(registration.expiryDate) 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isExpired(registration.expiryDate) ? 'Expired' : 'Active'}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Insurance Provider</p>
                    <p className="font-medium">{registration.policy.insuranceCompany}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Covered Hospital</p>
                    <p className="font-medium">{registration.policy.coveredHospital}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Policy Price</p>
                    <p className="font-medium">KES {registration.policy.policyPrice}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Policy Duration</p>
                    <p className="font-medium">{registration.policy.policyDuration} month(s)</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Registered On</p>
                    <p className="font-medium">{formatDate(registration.registrationDate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Expires On</p>
                    <p className={`font-medium ${isExpired(registration.expiryDate) ? 'text-red-600' : ''}`}>
                      {formatDate(registration.expiryDate)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                <button 
                  onClick={() => navigate(`/file-claim/${registration._id}`)}
                 className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
                >
                  File a Claim
                </button>
                  <a 
                    href={`/policy-details/${registration.policy._id}`}
                    className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    View Details
                  </a>
                </div>

                {/* Auto-Renew Suggestion */}
                {checkAutoRenew(registration.expiryDate) && (
                  <div className="mt-4 text-yellow-600 font-semibold">
                    <p>Auto-Renewal Suggestion: This policy is about to expire within 30 days. Consider renewing it soon!</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPolicies;