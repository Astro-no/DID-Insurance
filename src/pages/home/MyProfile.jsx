import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
    did: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token being sent:", token); // Debugging log

        const response = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("API Response:", data); // Debugging log

        if (response.ok) {
          setUserInfo({
            name: data.name, // This will now be full name from the backend
            email: data.email,
            role: data.role,
            did: data.did,
          });
        } else {
          console.error("Failed to fetch profile:", data.message);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 px-4">
      <div className="max-w-full mx-auto text-center">
        <h1 className="text-4xl font-bold p-2 mb-2 border-b border-neutral-300">
          My Profile
        </h1>
        {isLoading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="mt-4">
            <label className="block mb-2">
              Name:
              <input
                type="text"
                name="name"
                value={userInfo.name}
                readOnly
                className="mt-1 p-2 rounded bg-gray-800 text-white w-full"
              />
            </label>
            <label className="block mb-2">
              Email:
              <input
                type="email"
                name="email"
                value={userInfo.email}
                readOnly
                className="mt-1 p-2 rounded bg-gray-800 text-white w-full"
              />
            </label>
            <label className="block mb-2">
              Role:
              <input
                type="text"
                name="role"
                value={userInfo.role}
                readOnly
                className="mt-1 p-2 rounded bg-gray-800 text-white w-full"
              />
            </label>
            <label className="block mb-2">
              DID:
              <input
                type="text"
                name="did"
                value={userInfo.did}
                readOnly
                className="mt-1 p-2 rounded bg-gray-800 text-white w-full"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
