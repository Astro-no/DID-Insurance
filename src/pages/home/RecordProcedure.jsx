import React, { useState, useEffect } from "react";
import axios from "axios"; // For sending VC to the policyholder

const RecordProcedure = ({ contract, accounts, getDID }) => {
  const [procedureName, setProcedureName] = useState("");
  const [procedureTimestamp, setProcedureTimestamp] = useState("");
  const [patientDID, setPatientDID] = useState(""); // New: input by hospital
  const [vcData, setVcData] = useState(null); // State to store VC data
  const [loading, setLoading] = useState(false);
  const [hospitalDID, setHospitalDID] = useState(""); // To store hospital DID

  useEffect(() => {
    const fetchHospitalDID = async () => {
      try {
        const hospitalDID = await getDID(accounts[0]);
        setHospitalDID(hospitalDID);
      } catch (error) {
        console.error("Failed to fetch DID:", error);
      }
    };

    if (accounts && accounts.length > 0) {
      fetchHospitalDID();
    } else {
      console.log("Accounts not available yet in RecordProcedure.");
    }
  }, [accounts, getDID]);

  const handleRecordProcedure = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const timestamp = Math.floor(new Date(procedureTimestamp).getTime() / 1000);

      if (!contract || !contract.methods) {
        alert("Smart contract not loaded. Please make sure you're connected to MetaMask.");
        setLoading(false);
        return;
      }      
      await contract.methods
        .recordProcedure(procedureName, timestamp)
        .send({ from: accounts[0] });

      alert("Procedure recorded successfully!");

      const vc = {
        procedureName,
        procedureTimestamp: timestamp,
        hospitalDID,
        policyholderDID: patientDID,
        issuedTo: patientDID,
        issuanceDate: new Date().toISOString(),
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
      const response = await axios.post("http://localhost:5000/api/send-vc", {
        vc,
        policyholderAddress: patientDID,
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
        >
          {loading ? "Recording..." : "Record Procedure"}
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
