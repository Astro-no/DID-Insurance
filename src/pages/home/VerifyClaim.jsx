import React, { useState, useEffect } from "react";

const VerifyClaim = ({ contract, accounts }) => {
  const [loading, setLoading] = useState(false);
  const [pendingClaims, setPendingClaims] = useState([]);

  // Fetch pending claims
  const fetchPendingClaims = async () => {
    if (!contract || !accounts.length) return;

    setLoading(true);
    try {
      const pendingClaimIds = await contract.methods.getPendingClaims().call();

      const claimsData = await Promise.all(
        pendingClaimIds.map(async (id) => {
          const claim = await contract.methods.getClaim(id).call();
          return {
            ...claim,
            claimAmount: window.web3.utils.fromWei(claim.claimAmount, "ether"),
            submissionTime: new Date(claim.submissionTime * 1000).toLocaleString(),
            status: ["Submitted", "Approved", "Rejected", "Settled", "Disputed"][claim.status],
          };
        })
      );

      setPendingClaims(claimsData);
    } catch (error) {
      console.error("Error fetching pending claims:", error);
      alert("Failed to fetch pending claims");
    } finally {
      setLoading(false);
    }
  };

  // Handle claim verification (accept/reject)
  const handleVerifyClaim = async (claimId, accepted) => {
    if (!contract || !accounts.length) {
      alert("Web3 not initialized or not connected!");
      return;
    }

    setLoading(true);
    try {
      const methodName = accepted ? "acceptClaim" : "rejectClaim";
      await contract.methods[methodName](claimId).send({ from: accounts[0] });

      alert(`Claim ${claimId} ${accepted ? "accepted" : "rejected"} successfully!`);
      fetchPendingClaims(); // Refresh the list after action
    } catch (error) {
      console.error(`Error ${accepted ? "accepting" : "rejecting"} claim:`, error);
      alert(`Failed to ${accepted ? "accept" : "reject"} claim: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingClaims();
  }, [contract, accounts]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Admin: Verify Claims
      </h1>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Claims Pending Verification</h2>

        {loading ? (
          <p className="text-gray-600 italic">Loading pending claims...</p>
        ) : pendingClaims.length === 0 ? (
          <p className="text-gray-600 italic">No pending claims found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Claim ID</th>
                  <th className="py-2 px-4 border-b text-left">Procedure</th>
                  <th className="py-2 px-4 border-b text-left">Patient</th>
                  <th className="py-2 px-4 border-b text-left">Amount</th>
                  <th className="py-2 px-4 border-b text-left">Submitted</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingClaims.map((claim) => (
                  <tr key={claim.claimId}>
                    <td className="py-2 px-4 border-b">{claim.claimId}</td>
                    <td className="py-2 px-4 border-b">{claim.procedureId}</td>
                    <td className="py-2 px-4 border-b truncate max-w-xs">{claim.patientAddress}</td>
                    <td className="py-2 px-4 border-b">{claim.claimAmount} ETH</td>
                    <td className="py-2 px-4 border-b">{claim.submissionTime}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyClaim(claim.claimId, true)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleVerifyClaim(claim.claimId, false)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchPendingClaims}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh List
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyClaim;