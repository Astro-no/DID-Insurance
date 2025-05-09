import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Insurance from "../../contracts/Insurance.json";
import CreatePolicy from "./CreatePolicy";
import RecordProcedure from "./RecordProcedure";
import MakeClaim from "./MakeClaim";
import VerifyClaim from "./VerifyClaim";
import PolicyStatus from "./PolicyStatus";
import Preloader from "./Preloader";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(""); // Track user role

  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    const userRole = sessionStorage.getItem("role"); // Fetch user role

    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    setRole(userRole);

    // ✅ Redirect to the admin panel if user is an admin
    if (userRole === "admin") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const provider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:7545"
        );
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
      } catch (error) {
        console.error("Error initializing web3:", error);
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (web3) {
        const fetchedAccounts = await web3.eth.getAccounts();
        setAccounts(fetchedAccounts);
      }
    };
    fetchAccounts();
  }, [web3]);

  useEffect(() => {
    const fetchContract = async () => {
      if (web3) {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Insurance.networks[networkId];
        if (deployedNetwork) {
          const contractInstance = new web3.eth.Contract(
            Insurance.abi,
            deployedNetwork.address
          );
          setContract(contractInstance);
        }
      }
    };
    fetchContract();
  }, [web3]);

  const handleTabChange = (tab) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 px-4">
      <div className="max-w-full mx-auto text-center">
        <h1 className="text-4xl font-bold p-2 mb-2 border-b border-neutral-300">
          Insurance App
        </h1>
        <p className="text-lg mb-[1rem]">User Role: {role}</p>

        {/* Tab Navigation Based on User Role */}
        <div className="flex justify-center mb-[2rem]">
          {role === "admin" && (
            <>
              <button
                className={`${
                  activeTab === "createPolicy"
                    ? "bg-orange-700 text-white"
                    : "bg-orange-500 text-white"
                } py-2 px-4 rounded-sm hover:bg-orange-300 transition duration-300 mr-2`}
                onClick={() => handleTabChange("createPolicy")}
              >
                Create Policy
              </button>
              <button
                className={`${
                  activeTab === "verifyClaim"
                    ? "bg-orange-700 text-white"
                    : "bg-orange-500 text-white"
                } py-2 px-4 rounded-sm hover:bg-orange-300 transition duration-300 mr-2`}
                onClick={() => handleTabChange("verifyClaim")}
              >
                Verify Claim
              </button>
            </>
          )}

          {role === "policyholder" && (
            <>
              <button
                className={`${
                  activeTab === "policyStatus"
                    ? "bg-orange-700 text-white"
                    : "bg-orange-500 text-white"
                } py-2 px-4 rounded-sm hover:bg-orange-300 transition duration-300 mr-2`}
                onClick={() => handleTabChange("policyStatus")}
              >
                Policy Status
              </button>
              <button
                className={`${
                  activeTab === "makeClaim"
                    ? "bg-orange-700 text-white"
                    : "bg-orange-500 text-white"
                } py-2 px-4 rounded-sm hover:bg-orange-300 transition duration-300 mr-2`}
                onClick={() => handleTabChange("makeClaim")}
              >
                Make Claim
              </button>
            </>
          )}

          {role === "hospital" && (
            <button
              className={`${
                activeTab === "recordProcedure"
                  ? "bg-orange-700 text-white"
                  : "bg-orange-500 text-white"
              } py-2 px-4 rounded-sm hover:bg-orange-300 transition duration-300 mr-2`}
              onClick={() => handleTabChange("recordProcedure")}
            >
              Record Procedure
            </button>
          )}

          <button
            className="bg-red-600 text-white py-2 px-4 rounded-sm hover:bg-red-700 transition duration-300"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Preloader */}
        {isLoading && <Preloader />}

        {/* Rendering Components Based on Active Tab */}
        <div className="mt-8">
          {activeTab === "createPolicy" && role === "admin" && (
            <CreatePolicy contract={contract} accounts={accounts} />
          )}
          {activeTab === "recordProcedure" && role === "hospital" && (
            <RecordProcedure contract={contract} accounts={accounts} />
          )}
          {activeTab === "makeClaim" && role === "policyholder" && (
            <MakeClaim contract={contract} accounts={accounts} />
          )}
          {activeTab === "verifyClaim" && role === "admin" && (
            <VerifyClaim contract={contract} accounts={accounts} />
          )}
          {activeTab === "policyStatus" && role === "policyholder" && (
            <PolicyStatus contract={contract} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;