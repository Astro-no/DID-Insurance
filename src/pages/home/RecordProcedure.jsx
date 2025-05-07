import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const RecordProcedure = ({ accounts, getDID }) => {
  const [procedureName, setProcedureName] = useState("");
  const [procedureTimestamp, setProcedureTimestamp] = useState("");
  const [patientDID, setPatientDID] = useState("");
  const [vcData, setVcData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitalDID, setHospitalDID] = useState("");
  const [fetchingDID, setFetchingDID] = useState(true);
  const [didError, setDidError] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token from localStorage
    navigate("/login"); // Redirect to the login page
  };

  // Function to generate a mock DID from an Ethereum address
  const generateMockDID = (address) => {
    if (!address) return null;
    // Create a simple did:ethr: DID from the address
    return `did:ethr:${address.toLowerCase()}`;
  };

  // Use the provided getDID function or fallback to our mock implementation
  const resolveDID = async (address) => {
    if (typeof getDID === 'function') {
      return await getDID(address);
    } else {
      console.warn("getDID function not provided, using mock implementation");
      return generateMockDID(address);
    }
  };

  // Effect to handle Web3 and metamask connection
  useEffect(() => {
    const connectWallet = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          console.log("MetaMask is installed!");
          
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("Connected accounts:", accounts);
          
          if (accounts && accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          } else {
            setDidError("No accounts found. Please connect your wallet.");
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (newAccounts) => {
            console.log("Accounts changed:", newAccounts);
            if (newAccounts.length > 0) {
              setCurrentAccount(newAccounts[0]);
            } else {
              setCurrentAccount("");
              setDidError("No accounts connected");
            }
          });
          
        } else {
          setDidError("MetaMask is not installed. Please install MetaMask to use this application.");
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        setDidError("Failed to connect wallet: " + (error.message || "Unknown error"));
      }
    };
    
    connectWallet();
    
    // Cleanup function to remove event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch hospital DID when account is available
  useEffect(() => {
    const fetchHospitalDID = async () => {
      setFetchingDID(true);
      setDidError(null);
      
      if (!currentAccount) {
        setDidError("No account available");
        setFetchingDID(false);
        return;
      }
      
      try {
        console.log("Fetching DID for account:", currentAccount);
        const did = await resolveDID(currentAccount);
        console.log("Hospital DID fetched:", did);
        setHospitalDID(did);
        setFetchingDID(false);
      } catch (error) {
        console.error("Failed to fetch hospital DID:", error);
        setDidError(error.message || "Failed to fetch DID");
        setFetchingDID(false);
      }
    };

    if (currentAccount) {
      fetchHospitalDID();
    }
  }, [currentAccount]);

  const handleRecordProcedure = async (event) => {
    event.preventDefault();
    
    if (!currentAccount) {
      alert("Please connect your wallet first.");
      return;
    }
    
    if (fetchingDID) {
      alert("Still fetching hospital DID. Please wait a moment and try again.");
      return;
    }
    
    if (!hospitalDID) {
      alert(`Hospital DID is not available: ${didError || "Unknown error"}. Please check your connection and try again.`);
      return;
    }
    
    setLoading(true);

    try {
      const timestamp = Math.floor(new Date(procedureTimestamp).getTime() / 1000);

      // Skipping smart contract interaction
      console.log("Skipping smart contract; issuing VC directly.");

      const vc = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", "MedicalProcedureCredential"],
        issuer: hospitalDID,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: patientDID,
          procedure: {
            name: procedureName,
            timestamp: timestamp,
          },
        },
        policyholderAddress: patientDID,
      };

      setVcData(vc);

      await sendVCToPolicyholder(vc);

      alert("Verifiable Credential generated and sent to the policyholder!");
    } catch (error) {
      alert(`Failed to record procedure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendVCToPolicyholder = async (vc) => {
    try {
      // Save the VC first
      const saveResponse = await axios.post("http://localhost:5000/api/procedures/", { vc });
      console.log("VC saved successfully on backend:", saveResponse.data);

      // Then, potentially send a notification or the VC data to the policyholder
      const sendResponse = await axios.post("http://localhost:5000/api/send-vc", {
        vc,
        policyholderAddress: patientDID,
      });
      console.log("VC sent to policyholder:", sendResponse.data);

    } catch (error) {
      console.error("Error sending VC to policyholder:", error);
      if (error.response) {
        console.error("Backend error details:", error.response.data);
      } else if (error.request) {
        console.error("No response received from backend:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
      throw new Error("Failed to send VC. Check console for details.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-md shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Record Procedure</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>

      {!currentAccount && !didError && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-center text-yellow-700">
            Please connect your wallet to continue.
          </p>
          <button 
            onClick={async () => {
              try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                  setCurrentAccount(accounts[0]);
                }
              } catch (error) {
                console.error("Failed to connect wallet:", error);
                setDidError("Failed to connect wallet: " + (error.message || "Unknown error"));
              }
            }}
            className="mt-2 w-full py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            Connect Wallet
          </button>
        </div>
      )}
      
      {currentAccount && (
        <div className="mb-4 text-gray-600 text-center">
          Connected Account: {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}
        </div>
      )}
      
      {fetchingDID && currentAccount && (
        <div className="mb-4 text-blue-600 text-center">
          Fetching hospital DID...
        </div>
      )}
      
      {didError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-center">
          Error loading hospital DID: {didError}
        </div>
      )}
      
      {hospitalDID && (
        <div className="mb-4 text-green-600 text-center">
          Hospital DID loaded successfully
        </div>
      )}
      
      <form onSubmit={handleRecordProcedure} className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Patient's DID"
            value={patientDID}
            onChange={(e) => setPatientDID(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Procedure Name"
            value={procedureName}
            onChange={(e) => setProcedureName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <input
            type="datetime-local"
            value={procedureTimestamp}
            onChange={(e) => setProcedureTimestamp(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300"
          disabled={fetchingDID || !hospitalDID || loading}
        >
          {loading ? "Recording..." : fetchingDID ? "Waiting for DID..." : "Record Procedure"}
        </button>
      </form>

      {vcData && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold">Generated Verifiable Credential (VC)</h3>
          <pre className="text-sm mt-2">{JSON.stringify(vcData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RecordProcedure;