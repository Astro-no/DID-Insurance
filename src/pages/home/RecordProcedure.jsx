import React, { useState, useEffect } from "react";
import axios from "axios"; // For sending VC to the policyholder

const RecordProcedure = ({ contract, accounts, policyholderAddress, getDID }) => {
  const [procedureName, setProcedureName] = useState("");
  const [procedureTimestamp, setProcedureTimestamp] = useState("");
  const [vcData, setVcData] = useState(null); // State to store VC data
  const [loading, setLoading] = useState(false);
  const [hospitalDID, setHospitalDID] = useState(""); // To store hospital DID

  useEffect(() => {
    const fetchHospitalDID = async () => {
      try {
        // Get the hospital's DID (this function should retrieve it from a DID registry or other source)
        const hospitalDID = await getDID(accounts[0]); // Assuming getDID is a function that fetches DID
        setHospitalDID(hospitalDID);
      } catch (error) {
        console.error("Failed to fetch DID:", error);
      }
    };

    if (accounts[0]) {
      fetchHospitalDID();
    }
  }, [accounts, getDID]);

  const handleRecordProcedure = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Convert the procedureTimestamp to a Unix timestamp
      const timestamp = Math.floor(new Date(procedureTimestamp).getTime() / 1000);

      // Record procedure on the smart contract
      await contract.methods
        .recordProcedure(procedureName, timestamp)
        .send({ from: accounts[0] });

      alert("Procedure recorded successfully!");

      // Create Verifiable Credential (VC) with the hospital's DID
      const vc = {
        procedureName,
        procedureTimestamp: timestamp,
        hospitalDID, // Add the hospital's DID here
        policyholderDID: policyholderAddress, // Assuming policyholderAddress is the DID of the policyholder
        issuedTo: policyholderAddress, // Policyholder address to whom the VC is issued
        issuanceDate: new Date().toISOString(),
      };

      setVcData(vc); // Store VC in state

      // Optionally, send the VC to the backend to store or send to the policyholder
      await sendVCToPolicyholder(vc);

      alert("Verifiable Credential generated and sent to the policyholder!");

    } catch (error) {
      alert(`Failed to record procedure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to send VC to the policyholder (via backend or smart contract)
  const sendVCToPolicyholder = async (vc) => {
    try {
      const response = await axios.post("http://localhost:5000/api/send-vc", {
        vc,
        policyholderAddress,
      });
      console.log("VC sent to policyholder:", response.data);
    } catch (error) {
      console.error("Error sending VC to policyholder:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-md shadow-lg mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        Record Procedure
      </h2>
      <form onSubmit={handleRecordProcedure} className="space-y-6">
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
        >
          {loading ? "Recording..." : "Record Procedure"}
        </button>
      </form>

      {/* Display VC Data (for debugging purposes) */}
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
