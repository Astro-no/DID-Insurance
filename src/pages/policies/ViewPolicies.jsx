import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/policies");
        setPolicies(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching policies:", error);
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleRegisterClick = (policy) => {
    setSelectedPolicy(policy);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedPolicy(null);
  };
  const updateUserRoleToPolicyholder = async () => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.put(
        "http://localhost:5000/api/updateRole", // adjust if you use a different endpoint
        { role: "policyholder" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("User role updated to policyholder");
      localStorage.setItem("role", "policyholder"); // Optional: if you're storing it locally
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };
  
  const handleRegisterConfirm = async () => {
    if (!selectedPolicy) return;

    try {
      setRegistering(true);
      
      // Get the user's token for authentication
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to register for a policy");
        navigate("/login"); // Redirect to login page
        return;
      }

      // Make API call to register for the policy
      const response = await axios.post(
        "http://localhost:5000/api/policies/register",
        { policyId: selectedPolicy._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await updateUserRoleToPolicyholder(); // 👈 update role after registering
        alert("Policy registered successfully!");
        navigate("/policyholder-dashboard"); // Redirect to policyholder dashboard
      } else {
        alert(`Registration failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error registering for policy:", error);
      alert(`Registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setRegistering(false);
      closeModal();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
<h2 className="text-2xl font-bold mb-6 text-center">Available Policies</h2>
      
      {policies.length === 0 ? (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center">
          No policies available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div
              key={policy._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-blue-800">{policy.policyName}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {policy.insuranceCompany}
                  </span>
                </div>
                
                <div className="mt-4 text-gray-700">
                  <p className="mb-4">{policy.policyDescription}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Price:</span>
                      <p className="text-xl font-bold text-green-600">KES {policy.policyPrice}</p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p>{policy.policyDuration} month(s)</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Covered Hospital:</span>
                      <p>{policy.coveredHospital}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRegisterClick(policy)}
                  className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Register for Policy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Policy Registration</h3>
            <p className="mb-4">Are you sure you want to register for <span className="font-semibold">{selectedPolicy.policyName}</span>?</p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p><span className="font-medium">Price:</span> KES {selectedPolicy.policyPrice}</p>
              <p><span className="font-medium">Duration:</span> {selectedPolicy.policyDuration} month(s)</p>
              <p><span className="font-medium">Provider:</span> {selectedPolicy.insuranceCompany}</p>
              <p><span className="font-medium">Hospital:</span> {selectedPolicy.coveredHospital}</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={registering}
              >
                Cancel
              </button>
              <button 
                onClick={handleRegisterConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={registering}
              >
                {registering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : "Confirm Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPolicies;