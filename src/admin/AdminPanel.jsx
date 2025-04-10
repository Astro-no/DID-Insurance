import React, { useEffect, useState } from "react";
import CreatePolicy from "../pages/home/CreatePolicy";
import VerifyClaim from "../pages/home/VerifyClaim";

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
    coveredHospital: "Agha Khan"
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  
  // Fetch policies when viewing the policies list
  useEffect(() => {
    if (view === "policiesList") {
      fetchPolicies();
    }
  }, [view]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/policies", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      const response = await fetch(`http://localhost:5000/api/admin/users/did/${did}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      const response = await fetch(`http://localhost:5000/api/auth/approve-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      const response = await fetch("http://localhost:5000/api/policies/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
          coveredHospital: "Agha Khan"
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
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(user => user.status !== "approved").length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">No users pending approval</td>
                  </tr>
                ) : (
                  users.filter(user => user.status !== "approved").map((user) => (
                    <tr key={user._id} className="border-t">
                      <td className="px-4 py-3">{user.firstName} {user.secondName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className={`px-4 py-3 font-medium ${user.status === "approved" ? "text-green-600" : "text-red-500"}`}>{user.status}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => approveUser(user._id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition">Approve</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    name="policyPrice"
                    value={policyForm.policyPrice}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter price"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                  <input
                    type="number"
                    name="policyDuration"
                    value={policyForm.policyDuration}
                    onChange={handlePolicyFormChange}
                    placeholder="Enter duration in months"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <select
                    name="insuranceCompany"
                    value={policyForm.insuranceCompany}
                    onChange={handlePolicyFormChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="AIG">AIG</option>
                    <option value="Jubilee">Jubilee</option>
                    <option value="NHIF">NHIF</option>
                    <option value="AAR">AAR</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Description</label>
                <textarea
                  name="policyDescription"
                  value={policyForm.policyDescription}
                  onChange={handlePolicyFormChange}
                  placeholder="Enter detailed policy description"
                  className="w-full border border-gray-300 rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Covered Hospital</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="aghaKhan"
                      name="coveredHospital"
                      value="Agha Khan"
                      checked={policyForm.coveredHospital === "Agha Khan"}
                      onChange={handlePolicyFormChange}
                      className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="aghaKhan" className="text-gray-700">Agha Khan Hospital</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="nairobiHospital"
                      name="coveredHospital"
                      value="Nairobi Hospital"
                      checked={policyForm.coveredHospital === "Nairobi Hospital"}
                      onChange={handlePolicyFormChange}
                      className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="nairobiHospital" className="text-gray-700">Nairobi Hospital</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="kenyattaHospital"
                      name="coveredHospital"
                      value="Kenyatta Hospital"
                      checked={policyForm.coveredHospital === "Kenyatta Hospital"}
                      onChange={handlePolicyFormChange}
                      className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="kenyattaHospital" className="text-gray-700">Kenyatta Hospital</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="mpshahHospital"
                      name="coveredHospital"
                      value="MP Shah Hospital"
                      checked={policyForm.coveredHospital === "MP Shah Hospital"}
                      onChange={handlePolicyFormChange}
                      className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="mpshahHospital" className="text-gray-700">MP Shah Hospital</label>
                  </div>
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

        {view === "policiesList" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">All Policies</h2>
              <button 
                onClick={fetchPolicies} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {policies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No policies found. Create some policies to see them here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                      <th className="px-4 py-2 text-left">Provider</th>
                      <th className="px-4 py-2 text-left">Hospital</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-blue-600">{policy.policyName}</td>
                        <td className="px-4 py-3">${policy.policyPrice}</td>
                        <td className="px-4 py-3">{policy.policyDuration} months</td>
                        <td className="px-4 py-3">{policy.insuranceCompany}</td>
                        <td className="px-4 py-3">{policy.coveredHospital}</td>
                        <td className="px-4 py-3">{formatDate(policy.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {view === "claims" && <VerifyClaim contract={contract} accounts={accounts} />}
      </div>
    </div>
  );
};

export default AdminPanel;