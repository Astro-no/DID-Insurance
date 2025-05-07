import React, { useState } from "react";
import axios from "axios";

const ReplyToMessage = ({ messageId, onReplySent }) => {
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleReply = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFeedback("You must be logged in as an admin to reply.");
        return;
      }

      const res = await axios.post(
        `http://localhost:5000/api/messages/${messageId}/respond`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setFeedback("Reply sent successfully!");
        setResponse("");
        onReplySent(); // Callback to refresh the message list
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setFeedback("Failed to send reply. Please try again.");
    }
  };

  return (
    <form onSubmit={handleReply} className="space-y-4">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your reply here..."
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow transition-colors"
      >
        Send Reply
      </button>
      {feedback && <p className="mt-2 text-sm text-gray-600">{feedback}</p>}
    </form>
  );
};

export default ReplyToMessage;