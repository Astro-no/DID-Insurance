import React, { useEffect, useState } from "react";
import CreatePolicy from "../pages/home/CreatePolicy";
import VerifyClaim from "../pages/home/VerifyClaim";
import axios from "axios";

const AdminPanel = ({ contract, accounts }) => {
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  const [did, setDid] = useState(""); // Input field for DID
  const [view, setView] = useState("users"); // 'users', 'policies', 'claims', 'policiesList', 'reports'
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("weekly");
  const [reportDate, setReportDate] = useState("");
  const [reportGenerating, setReportGenerating] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Generate weekly report
  const generateReport = async () => {
    try {
      setReportGenerating(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const endpoint = reportType === "weekly" 
        ? `http://localhost:5000/api/reports/weekly/pdf${reportDate ? `?date=${reportDate}` : ''}`
        : `http://localhost:5000/api/reports/monthly/pdf${reportDate ? `?date=${reportDate}` : ''}`;
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = reportDate || new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `${reportType}-report-${dateStr}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        console.error("Failed to generate report:", response.statusText);
        alert("Failed to generate report. Please try again.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("An error occurred while generating the report");
    } finally {
      setReportGenerating(false);
    }
  };
  

  // Download report as PDF
  const downloadReportPDF = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Use the correct endpoint for downloading PDF reports
      const endpoint = reportType === "weekly"
        ? `http://localhost:5000/api/reports/weekly/pdf${reportDate ? `?date=${reportDate}` : ''}`
        : `http://localhost:5000/api/reports/monthly/pdf${reportDate ? `?date=${reportDate}` : ''}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Create a blob from the PDF Stream
        const blob = await response.blob();

        // Create a link element and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = reportDate || new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `${reportType}-report-${dateStr}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        console.error("Failed to download report:", response.statusText);
        alert("Failed to download report. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("An error occurred while downloading the report");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get current date in YYYY-MM-DD format for date input
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setReportDate(today);
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/claims/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaims(response.data);
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchClaims();
  }, []);

  // Add the updateClaimStatus function here
  const updateClaimStatus = async (claimId, status) => {
    try {
      console.log("Updating claim with ID:", claimId, "to status:", status);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/claims/${claimId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Claim ${status} successfully!`);
      setClaims((prevClaims) =>
        prevClaims.map((claim) =>
          claim._id === claimId ? { ...claim, status } : claim
        )
      );
    } catch (error) {
      console.error(`Error updating claim status to ${status}:`, error);
      alert(`Failed to ${status} claim. Please try again.`);
    }
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
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${view === "reports" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-indigo-100"}`} 
            onClick={() => setView("reports")}
          >
            Reports
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

        {/* Reports section */}
        {view === "reports" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generate Reports</h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Report Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <button 
                    onClick={generateReport}
                    disabled={reportGenerating}
                    className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors ${reportGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {reportGenerating ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>

            {reportData && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {reportType === "weekly" ? "Weekly Report" : "Monthly Report"}
                  </h3>
                  <button
                    onClick={downloadReportPDF}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    Download PDF
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">User Statistics</h4>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p><strong>Total Users:</strong> {reportData.userStats?.totalUsers || 0}</p>
                        <p><strong>New Users:</strong> {reportData.userStats?.newUsers || 0}</p>
                        <p><strong>Active Users:</strong> {reportData.userStats?.activeUsers || 0}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Policy Statistics</h4>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p><strong>Total Policies:</strong> {reportData.policyStats?.totalPolicies || 0}</p>
                        <p><strong>New Policies:</strong> {reportData.policyStats?.newPolicies || 0}</p>
                        <p><strong>Average Policy Price:</strong> ${reportData.policyStats?.avgPolicyPrice?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Claim Statistics</h4>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p><strong>Total Claims:</strong> {reportData.claimStats?.totalClaims || 0}</p>
                        <p><strong>New Claims:</strong> {reportData.claimStats?.newClaims || 0}</p>
                        <p><strong>Approved Claims:</strong> {reportData.claimStats?.approvedClaims || 0}</p>
                        <p><strong>Rejected Claims:</strong> {reportData.claimStats?.rejectedClaims || 0}</p>
                        <p><strong>Pending Claims:</strong> {reportData.claimStats?.pendingClaims || 0}</p>
                        <p><strong>Average Claim Amount:</strong> ${reportData.claimStats?.avgClaimAmount?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Revenue Statistics</h4>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p><strong>Total Revenue:</strong> ${reportData.revenueStats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                        <p><strong>Period Revenue:</strong> ${reportData.revenueStats?.periodRevenue?.toFixed(2) || '0.00'}</p>
                        <p><strong>Projected Monthly Revenue:</strong> ${reportData.revenueStats?.projectedMonthlyRevenue?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weekly summary */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Summary</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p>{reportData.summary || "No summary available."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Reports Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Scheduled Reports</h3>
              
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-lg font-medium">Weekly Performance Report</span>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Every Monday, 8:00 AM</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm">
                    Edit Schedule
                  </button>
                  <button className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm">
                    Disable
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Schedule New Report
                  </span>
                </button>
              </div>
            </div>
            
          </div>
        )}

        {/* Claims verification section */}
        {view === "claims" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verify Claims</h2>
            {loading ? (
              <p>Loading claims...</p>
            ) : (
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                    <th className="px-4 py-2 text-left">Policy Name</th>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Claim Amount</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim._id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{claim.policy.policyName}</td>
                      <td className="px-4 py-2">{claim.user.name} ({claim.user.email})</td>
                      <td className="px-4 py-2">{claim.claimAmount}</td>
                      <td className="px-4 py-2">{claim.description}</td>
                      <td className="px-4 py-2">{claim.status}</td>
                      <td className="px-4 py-2">
                        {claim.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateClaimStatus(claim._id, "approved")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateClaimStatus(claim._id, "rejected")}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;