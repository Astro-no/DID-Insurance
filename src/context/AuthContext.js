import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

// Helper function to generate a DID from a public key or address
const generateDID = (address) => {
  if (!address) return null;
  const formattedAddress = address.startsWith('0x') ? address.toLowerCase() : `0x${address.toLowerCase()}`;
  return `did:ethr:${formattedAddress}`;
};

export const AuthProvider = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("auth_user");

        if (!token) {
          localStorage.removeItem("auth_user");
          setLoading(false);
          return;
        }

        let parsedUserData = null;
        if (userData) {
          try {
            parsedUserData = JSON.parse(userData);
          } catch (e) {
            console.error("Failed to parse stored user data:", e);
          }
        }

        try {
          const response = await axios.get("http://localhost:5000/api/auth/validate", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { user } = response.data;

          const did = generateDID(user.address || user.publicKey);

          setAuthenticatedUser({
            did,
            name: user.name || "User",
            address: user.address || user.publicKey,
            role: user.role || "user",
            token
          });

          localStorage.setItem("auth_user", JSON.stringify({
            did,
            name: user.name || "User",
            address: user.address || user.publicKey,
            role: user.role || "user"
          }));
        } catch (apiError) {
          console.error("API validation failed:", apiError);

          if (parsedUserData && parsedUserData.did) {
            console.log("Using cached user data as fallback");
            setAuthenticatedUser({
              ...parsedUserData,
              token
            });
          } else {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            setError("Authentication session expired. Please log in again.");
            setAuthenticatedUser(null);
          }
        }
      } catch (err) {
        console.error("Auth validation error:", err);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setError("Authentication session expired. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Load user from localStorage on app initialization
  useEffect(() => {
    const storedUser = localStorage.getItem("authenticatedUser");
    if (storedUser) {
      setAuthenticatedUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (authenticatedUser) {
      localStorage.setItem("authenticatedUser", JSON.stringify(authenticatedUser));
    } else {
      localStorage.removeItem("authenticatedUser");
    }
  }, [authenticatedUser]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("http://localhost:5000/api/auth/login", credentials);
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response from authentication server");
      }

      if (!user.address && !user.publicKey) {
        console.error("User data is incomplete: no address or publicKey.");
        throw new Error("Authentication failed: Missing necessary data (address/publicKey).");
      }

      const did = generateDID(user.address || user.publicKey);

      const authUser = {
        did,
        name: user.name || "User",
        address: user.address || user.publicKey,
        role: user.role || "user",
        token
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      setAuthenticatedUser(authUser);
      return authUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMsg);
      setAuthenticatedUser(null);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthenticatedUser(null);
    setError(null);
  };

  const updateUserInfo = (updates) => {
    if (!authenticatedUser) return;

    const updatedUser = {
      ...authenticatedUser,
      ...updates,
    };

    if (updates.address) {
      updatedUser.did = generateDID(updates.address);
    }

    localStorage.setItem("auth_user", JSON.stringify({
      did: updatedUser.did,
      name: updatedUser.name,
      address: updatedUser.address,
      role: updatedUser.role
    }));

    setAuthenticatedUser(updatedUser);
    return updatedUser;
  };

  const setMockUser = () => {
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const mockDid = generateDID(mockAddress);
    const mockToken = "mock_token_for_development";

    const mockUser = {
      did: mockDid,
      name: "Test User",
      address: mockAddress,
      role: "user",
      token: mockToken
    };

    localStorage.setItem("auth_token", mockToken);
    localStorage.setItem("auth_user", JSON.stringify({
      did: mockDid,
      name: "Test User",
      address: mockAddress,
      role: "user"
    }));

    setAuthenticatedUser(mockUser);
    return mockUser;
  };

  return (
    <AuthContext.Provider
      value={{
        authenticatedUser,
        setAuthenticatedUser,
        loading,
        error,
        login,
        logout,
        updateUserInfo,
        setMockUser // Only use this for development/testing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
