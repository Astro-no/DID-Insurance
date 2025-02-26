import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedAdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const response = await axios.get("http://localhost:5000/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.role === "admin") {
                    setIsAdmin(true);
                }

            } catch (error) {
                console.error("Error verifying admin:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    if (loading) {
        return <p>Loading...</p>; // Prevent premature redirection
    }

    return isAdmin ? children : <Navigate to="/" />;
};

export default ProtectedAdminRoute;
