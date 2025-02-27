import React, { useEffect, useState } from "react";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        console.log("Fetched users:", data); // Debugging line
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

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
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users pending approval
                </td>
              </tr>
            ) : (
              users.filter(user => user.status !== "approved").map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-3">{user.firstName} {user.secondName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className={`px-4 py-3 font-medium ${user.status === "approved" ? "text-green-600" : "text-red-500"}`}>
                    {user.status}
                  </td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => approveUser(user._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
