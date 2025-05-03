import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewVCs = () => {
  const { policyholderDID } = useParams();
  const [vcs, setVcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVCs = async () => {
      try {
        console.log("Fetching VCs for:", policyholderDID);
        const response = await axios.get(`http://localhost:5000/api/vcs/${encodeURIComponent(policyholderDID)}`);
        console.log("Fetched VCs:", response.data.vcs);
        setVcs(response.data.vcs);
      } catch (error) {
        console.error("Error fetching VCs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (policyholderDID) {
      fetchVCs();
    }
  }, [policyholderDID]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        Verifiable Credentials for {policyholderDID}
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="ml-4 text-gray-600">Loading...</p>
        </div>
      ) : vcs.length === 0 ? (
        <p className="text-lg text-center text-gray-600 py-6">No VCs found for this DID.</p>
      ) : (
        <ul className="space-y-4">
          {vcs.map((vcObj, index) => {
            const vc = vcObj.vc;
            const procedure = vc?.credentialSubject?.procedure;

            return (
              <li
                key={index}
                className="border border-gray-300 p-4 rounded-lg shadow-md bg-gray-50"
              >
                <h3 className="font-semibold text-xl text-gray-700 mb-2">
                  Verifiable Credential #{index + 1}
                </h3>
                <p><strong>Issuer:</strong> {vc.issuer}</p>
                <p><strong>Issued On:</strong> {new Date(vc.issuanceDate).toLocaleString()}</p>
                <p><strong>Procedure:</strong> {procedure?.name || "N/A"}</p>
                <p><strong>Timestamp:</strong> {procedure?.timestamp || "N/A"}</p>

                <details className="mt-4">
                  <summary className="text-blue-500 cursor-pointer">Raw VC JSON</summary>
                  <pre className="text-sm text-gray-600 mt-2">{JSON.stringify(vc, null, 2)}</pre>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ViewVCs;
