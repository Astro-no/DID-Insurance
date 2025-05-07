import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const MyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token from localStorage
    navigate("/login"); // Redirect to the login page
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token); // Debugging: Log the token
        if (!token) {
          setError("You must be logged in to view your messages.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Messages</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message._id} className="p-4 border rounded-lg shadow">
              <p>
                <strong>Message:</strong> {message.content}
              </p>
              {message.response ? (
                <p className="mt-2 text-green-600">
                  <strong>Admin's Reply:</strong> {message.response}
                </p>
              ) : (
                <p className="mt-2 text-gray-500">No reply yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMessages;