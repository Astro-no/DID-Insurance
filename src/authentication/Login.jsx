import { Mail, Lock, Eye, EyeClosed, Key } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Preloader from "../pages/home/Preloader";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [did, setDid] = useState(""); // For DID login
  const [useDidLogin, setUseDidLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  const toggleLoginMethod = () => setUseDidLogin((prev) => !prev);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("isAuthenticated", true);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      toast.success("Login successful!");

      // Check user role and navigate accordingly
      const userRole = response.data.user.role;

      setTimeout(() => {
        setLoading(false);
        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "policyholder") {
          navigate("/policyholder-dashboard");
        } else if (userRole === "hospital") {
          navigate("/hospital-dashboard");
        } else {
          navigate("/home");
        }
      }, 3000);
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Invalid email or password";
      toast.error(errorMessage);
      setPassword("");
    }
  };

  const handleDidLogin = async (e) => {
    e.preventDefault();
    if (!did) {
      toast.error("Please enter your DID");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/auth/login-did", {
        did
      });

      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("isAuthenticated", true);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      toast.success("DID login successful!");

      // Check user role and navigate accordingly
      const userRole = response.data.user.role;

      setTimeout(() => {
        setLoading(false);
        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "policyholder") {
          navigate("/policyholder-dashboard");
        } else if (userRole === "hospital") {
          navigate("/hospital-dashboard");
        } else {
          navigate("/home");
        }
      }, 3000);
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "DID not found. Please check your DID.";
      toast.error(errorMessage);
      setDid("");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-sm shadow-lg w-full max-w-[500px]">
        <h2 className="text-2xl font-semibold text-center mb-6 text-orange-600 uppercase">
          {useDidLogin ? "Login with DID" : "Login"}
        </h2>

        {useDidLogin ? (
          // Login with DID
          <form onSubmit={handleDidLogin}>
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600">Enter Your DID</p>
              <div className="flex items-center border-b-2 border-gray-300 mt-1">
                <Key className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  id="did"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  placeholder="did:ethr:0x..."
                  className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login with DID"}
            </button>
          </form>
        ) : (
          // Login with Email & Password
          <form onSubmit={handleEmailLogin}>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600">Email Address</p>
              <div className="flex items-center border-b-2 border-gray-300 mt-1">
                <Mail className="w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600">Password</p>
              <div className="flex items-center border-b-2 border-gray-300 mt-1">
                <Lock className="w-5 h-5 text-gray-500" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
                />
                <button type="button" className="p-1" onClick={togglePasswordVisibility}>
                  {passwordVisible ? <EyeClosed className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* Toggle between Login Methods */}
        <div className="mt-4 text-center">
          <button
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            onClick={toggleLoginMethod}
          >
            {useDidLogin ? "Login with Email & Password" : "Login with DID"}
          </button>
        </div>

        {/* Sign-Up Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {loading && <Preloader />}
    </div>
  );
};

export default Login;