import React, { useEffect, useState } from "react";
import CreatePolicy from "../pages/home/CreatePolicy";
import VerifyClaim from "../pages/home/VerifyClaim";

const AdminPanel = ({ contract, accounts }) => {
  const [users, setUsers] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  const [did, setDid] = useState(""); // Input field for DID
  const [view, setView] = useState("users"); // 'users', 'policies', 'claims'

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Admin Panel</h1>
        
        <div className="flex justify-around mb-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => setView("users")}>Manage Users</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg" onClick={() => setView("policies")}>Create Policy</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={() => setView("claims")}>Verify Claims</button>
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

        {view === "policies" && <CreatePolicy contract={contract} accounts={accounts} />}
        {view === "claims" && <VerifyClaim contract={contract} accounts={accounts} />}
      </div>
    </div>
  );
};

export default AdminPanel;
