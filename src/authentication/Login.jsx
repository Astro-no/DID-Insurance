import { Mail, Lock, Eye, EyeClosed, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Preloader from "../pages/home/Preloader";
import { getDID } from "../services/contractService";

const Login = () => {
  const [user, setUser] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [did, setDid] = useState("");
  const [useDidLogin, setUseDidLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHospital, setIsHospital] = useState(false);

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
      let response;
  
      // Conditional login request based on whether it's a hospital or not
      if (isHospital) {
        console.log("Sending hospital login request...");
        response = await axios.post("http://localhost:5000/hospital/login", {
          username: email,
          password,
        });
      } else {
        response = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });
      }
  
      // Check if the response contains user data
      if (response.data && response.data.user) {
        const user = response.data.user;
        console.log("Login successful, user data:", user);
  
        // Handle user status
        if (user.status && user.status !== "approved") {
          toast.error(`Account ${user.status}. Please wait for admin approval.`);
          setLoading(false);
          return;
        }
  
        // Store token and user in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAuthenticated", true);
        localStorage.setItem("user", JSON.stringify(user));
  
        setUser(user);
        toast.success("Login successful!");
  
        
        const userRole = user.role;
        setTimeout(() => {
          setLoading(false);
          if (userRole === "admin") navigate("/admin");
          else if (userRole === "policyholder") navigate("/policyholder-dashboard");
          else if (userRole === "hospital") navigate("/record-procedure");
          else if (userRole === "user") navigate("/view-policies");
          else navigate("/home");
        }, 3000);
      } else {
        console.error("Login response did not contain user data:", response.data);
        toast.error("Invalid username or password");
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Invalid email or password";
      toast.error(errorMessage);
      setPassword("");
    }
  };  

  const handleDidLogin = async (e) => {
    e.preventDefault();
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this feature');
      return;
    }

    if (!did) {
      toast.error("Please enter your DID");
      return;
    }

    console.log("Attempting DID login. DID:", did);

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0].toLowerCase();
      console.log("Connected wallet address:", currentAccount);
      const fetchedDID = await getDID(currentAccount);
      console.log("Fetched DID from contract:", fetchedDID);

      if (!fetchedDID || fetchedDID.toLowerCase() !== did.toLowerCase()) {
        toast.error("DID does not match your connected wallet address.");
        setLoading(false);
        return;
      }

      console.log("Sending DID login request...");
      const response = await axios.post("http://localhost:5000/api/auth/login-did", { did });
      console.log("DID login response:", response);
      const user = response.data.user;
      console.log("DID login successful, user data:", user);

      if (user.status && user.status !== "active" && user.status !== "approved") {
        toast.error(`Account ${user.status || "pending"}. Please wait for admin approval.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("isAuthenticated", true);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      toast.success("DID login successful!");

      const userRole = user.role;
      if (userRole === "admin") {
        toast.error("Admin accounts must log in using email.");
        setLoading(false);
        return;
      }

      setTimeout(() => {
        setLoading(false);
        console.log("Navigating based on role (DID):", userRole);
        if (userRole === "policyholder") navigate("/policyholder-dashboard");
        else if (userRole === "hospital") navigate("/hospital-dashboard");
        else if (userRole === "user") navigate("/view-policies");
        else navigate("/home");
      }, 3000);
    } catch (error) {
      setLoading(false);
      console.error("DID login error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || "DID not found. Please check your DID.";
      toast.error(errorMessage);
      setDid("");
    }
  };

  useEffect(() => {
    console.log("User object (useEffect):", user);
  }, [user]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-sm shadow-lg w-full max-w-[500px]">
        <h2 className="text-2xl font-semibold text-center mb-6 text-orange-600 uppercase">
          {useDidLogin ? "Login with DID" : isHospital ? "Hospital Login" : "Login"}
        </h2>

        {useDidLogin ? (
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
          <form onSubmit={handleEmailLogin}>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600">
                {isHospital ? "Username" : "Email Address"}
              </p>
              <div className="flex items-center border-b-2 border-gray-300 mt-1">
                <Mail className="w-5 h-5 text-gray-500" />
                <input
                  type={isHospital ? "text" : "email"}
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isHospital ? "Enter your username" : "Enter your email"}
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
                  {passwordVisible ? (
                    <EyeClosed className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
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

        <div className="mt-4 text-center">
          <button
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            onClick={toggleLoginMethod}
          >
            {useDidLogin ? "Login with Email & Password" : "Login with DID"}
          </button>
        </div>

        {!useDidLogin && (
          <div className="mt-2 text-center">
            <button
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              onClick={() => setIsHospital((prev) => !prev)}
            >
              {isHospital ? "Login as Policyholder" : "Login as Hospital"}
            </button>
          </div>
        )}

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