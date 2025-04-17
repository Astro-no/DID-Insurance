import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, User, IdCard } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { ContractContext } from "../context/ContractContext";

const Signup = () => {
  const contractContext = useContext(ContractContext);
  const navigate = useNavigate();

  // Declare all hooks at the top level
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [did, setDid] = useState("");
  const [didGenerated, setDidGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Check if context is ready
  if (!contractContext || !contractContext.account || !contractContext.didRegisterContract) {
    console.log("ContractContext:", contractContext); // Debugging log
  console.log("Account:", contractContext?.account); // Debugging log
  console.log("DID Register Contract:", contractContext?.didRegisterContract); // Debugging log
  
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-lg text-gray-700">Connecting to wallet...</div>
        <ToastContainer />
      </div>
    );
  }

  // Use context after check
  const { account, didRegisterContract } = contractContext;

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible((prev) => !prev);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;

  const validatePassword = (password) => {
    if (password.length < 8 || password.length > 10) {
      return "Password must be between 8 and 10 characters long";
    }
    if (!passwordRegex.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return null;
  };

  const generateDID = () => {
    if (didGenerated) return;
    const newDid = `did:ethr:${crypto.randomUUID()}`;
    setDid(newDid);
    setDidGenerated(true);
    toast.success("DID generated successfully!");
  };

  const registerOnChainDID = async () => {
    try {
      const tx = await didRegisterContract.registerDID("Policyholder", account);
      await tx.wait();
      console.log("DID registered on chain!");
      toast.success("DID successfully registered on blockchain.");
    } catch (err) {
      console.error("Failed to register DID on chain:", err);
      toast.error("Failed to register DID on the blockchain.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !secondName || !email || !idNumber || !password || !confirmPassword || !did) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^\d{8}$/.test(idNumber)) {
      toast.error("ID number must be 8 digits.");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      toast.error("Email must be a @gmail.com address.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          secondName,
          email,
          idNumber,
          password,
          did,
          role: "pending",
          status: "pending",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Signup successful! Awaiting admin approval.");
        await registerOnChainDID(); // Register DID on blockchain
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || data.error || "Signup failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[800px]">
        <h2 className="text-2xl font-semibold text-center text-orange-600 uppercase mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <button
              type="button"
              onClick={generateDID}
              disabled={didGenerated}
              className={`w-full py-2 ${
                didGenerated ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white font-semibold rounded-lg`}
            >
              {didGenerated ? "DID Generated" : "Generate DID"}
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">Your DID</p>
            <input
              type="text"
              value={did}
              readOnly
              placeholder="Click 'Generate DID'"
              className="w-full p-2 border rounded-md text-gray-700 bg-gray-200 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-between gap-4">
            <div className="mb-4 flex-1">
              <p className="text-sm font-medium text-gray-600">First Name</p>
              <div className="flex items-center border-b-2 border-gray-300 mt-1">
                <User className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="mb-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Second Name</p>
              <div className="flex items-center border-b-2 border-gray-300 mt-1">
                <User className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  placeholder="Enter your second name"
                  className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">Email Address</p>
            <div className="flex items-center border-b-2 border-gray-300 mt-1">
              <Mail className="w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">ID Number</p>
            <div className="flex items-center border-b-2 border-gray-300 mt-1">
              <IdCard className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your ID number"
                className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">Password</p>
            <div className="flex items-center border-b-2 border-gray-300 mt-1">
              <Lock className="w-5 h-5 text-gray-500" />
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="focus:outline-none"
              >
                {passwordVisible ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be 8-10 characters long and contain at least one uppercase letter, 
              one lowercase letter, one number, and one special character (@$!%*?&)
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">Confirm Password</p>
            <div className="flex items-center border-b-2 border-gray-300 mt-1">
              <Lock className="w-5 h-5 text-gray-500" />
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full p-2 pl-3 bg-transparent border-none focus:outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="focus:outline-none"
              >
                {confirmPasswordVisible ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            Note: After signing up, your account will need to be approved by an administrator before you can log in.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;