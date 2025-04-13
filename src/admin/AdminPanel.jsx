import React, { useEffect, useState } from "react";
import CreatePolicy from "../pages/home/CreatePolicy";
import VerifyClaim from "../pages/home/VerifyClaim";
import axios from "axios";

const AdminPanel = ({ contract, accounts }) => {
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  const [did, setDid] = useState(""); // Input field for DID
  const [view, setView] = useState("users"); // 'users', 'policies', 'claims', 'policiesList'
  
  // Policy form state
  const [policyForm, setPolicyForm] = useState({
    policyName: "",
    policyDescription: "",
    policyPrice: "",
    policyDuration: "",
    insuranceCompany: "AIG",
    coveredHospital: "Agha Khan",
    coverageDetails: "" // Coverage details input field
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No authentication token found");
      return;
    }
    
    axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
        const fetchedUsers = response.data?.users || response.data;
        if (Array.isArray(fetchedUsers)) {
            setUsers(fetchedUsers);
        } else {
            console.error("Unexpected response format:", response.data);
        }
    })
    .catch(error => {
      console.error("Error fetching users:", error);
      // Handle authentication errors (redirect to login page if needed)
      if (error.response && error.response.status === 401) {
        // You could redirect to login here
        // For example: window.location.replace("/login");
      }
    });
  }, []);
  
  // Fetch policies when viewing the policies list
  useEffect(() => {
    if (view === "policiesList") {
      fetchPolicies();
    }
  }, [view]);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await fetch("http://localhost:5000/api/policies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      } else {
        console.error("Failed to fetch policies:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  // Fetch user by DID
  const searchUserByDID = async () => {
    if (!did) {
      alert("Please enter a DID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/users/did/${did}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchedUser(data);
      } else {
        setSearchedUser(null);
        alert("User not found");
      }
    } catch (error) {
      console.error("Error searching user by DID:", error);
    }
  };

  const approveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/auth/approve-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: "user" }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("User approved successfully!");
        setUsers(users.map((user) => (user._id === userId ? { ...user, status: "approved" } : user)));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handlePolicyFormChange = (e) => {
    const { name, value } = e.target;
    setPolicyForm({
      ...policyForm,
      [name]: value,
    });
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await fetch("http://localhost:5000/api/policies/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policyForm),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Policy created successfully!");
        // Reset form
        setPolicyForm({
          policyName: "",
          policyDescription: "",
          policyPrice: "",
          policyDuration: "",
          insuranceCompany: "AIG",
          coveredHospital: "Agha Khan",
          coverageDetails: "" // Reset coverage details
        });
        
        // Switch to policies list view
        setView("policiesList");
        fetchPolicies();
      } else {
        alert(`Failed to create policy: ${data.message}`);
      }          
    } catch (error) {
      console.error("Error creating policy:", error);
      alert("An error occurred while creating the policy");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Admin Panel</h1>
        
        <div className="flex flex-wrap justify-around mb-6 gap-2">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${view === "users" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"}`} 
            onClick={() => setView("users")}
          >
            Manage Users
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${view === "policies" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-100"}`} 
            onClick={() => setView("policies")}
          >
            Create Policy
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${view === "policiesList" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-purple-100"}`} 
            onClick={() => setView("policiesList")}
          >
            View Policies
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${view === "claims" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-red-100"}`} 
            onClick={() => setView("claims")}
          >
            Verify Claims
          </button>
        </div>

        {view === "users" && (
          <>
            {/* Search bar for DID */}
            <div className="flex items-center mb-4">
              <input
                type="text"
                placeholder="Enter DID to search..."
                value={did}
                onChange={(e) => setDid(e.target.value)}
                className="border p-2 w-full rounded-lg"
              />
              <button onClick={searchUserByDID} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                Search
              </button>
            </div>

            {/* Display searched user if found */}
            {searchedUser && (
              <div className="bg-gray-200 p-4 rounded-lg mb-4">
                <h2 className="text-xl font-semibold">User Found:</h2>
                <p><strong>Name:</strong> {searchedUser.firstName} {searchedUser.secondName}</p>
                <p><strong>Email:</strong> {searchedUser.email}</p>
                <p><strong>Status:</strong> {searchedUser.status}</p>
                <p><strong>Role:</strong> {searchedUser.role}</p>
              </div>
            )}

            {/* User table */}
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200">
                    <td className="px-4 py-2">{user.firstName} {user.secondName}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.status}</td>
                    <td className="px-4 py-2">{user.role}</td>
                    <td className="px-4 py-2">
                      {user.status !== "approved" && (
                        <button 
                          onClick={() => approveUser(user._id)} 
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Policy creation form */}
        {view === "policies" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Policy</h2>
            <form onSubmit={handlePolicySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                  <input
                    type="text"
                    name="policyName"
                    value={policyForm.policyName}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter policy name"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Description</label>
                  <textarea
                    name="policyDescription"
                    value={policyForm.policyDescription}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter policy description"
                    className="w-full border border-gray-300 rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Price</label>
                  <input
                    type="number"
                    name="policyPrice"
                    value={policyForm.policyPrice}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter policy price"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Duration (Months)</label>
                  <input
                    type="number"
                    name="policyDuration"
                    value={policyForm.policyDuration}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter policy duration"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
                  <textarea
                    name="coverageDetails"
                    value={policyForm.coverageDetails}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter coverage details"
                    className="w-full border border-gray-300 rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg shadow transition-colors"
                >
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Policies List */}
        {view === "policiesList" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Policy List</h2>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                  <th className="px-4 py-2 text-left">Policy Name</th>
                  <th className="px-4 py-2 text-left">Policy Description</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Duration (Months)</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy._id} className="border-b border-gray-200">
                    <td className="px-4 py-2">{policy.policyName}</td>
                    <td className="px-4 py-2">{policy.policyDescription}</td>
                    <td className="px-4 py-2">{policy.policyPrice}</td>
                    <td className="px-4 py-2">{policy.policyDuration}</td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => {/* Handle policy actions like view or update */}} 
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
