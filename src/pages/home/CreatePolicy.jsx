import React, { useState } from "react";
import "./Home.css";

const CreatePolicy = ({ contract, accounts }) => {
  const [user, setUser] = useState("");
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [hospital, setHospital] = useState("");
  const [policyAmount, setPolicyAmount] = useState(0);
  const [premium, setPremium] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Fetch user details by DID
  const fetchUserByDID = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/did/${user}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();

      if (response.ok) {
        setUserDetails(data);
        alert(`User found: ${data.firstName} ${data.secondName}`);
      } else {
        alert("User not found");
      }
    } catch (error) {
      alert("Error fetching user");
    }
  };

  // Handle policy creation
  const handleCreatePolicy = async (event) => {
    event.preventDefault();
    try {
      await contract.methods
        .createIns(user, insuranceCompany, hospital, policyAmount, premium, startDate, endDate)
        .send({ from: accounts[0] });

      // Store in MongoDB
      await fetch("http://localhost:5000/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user, insuranceCompany, hospital, policyAmount, premium, startDate, endDate }),
      });

      alert("Policy created successfully!");
    } catch (error) {
      alert(`Failed to create policy: ${error.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-4 rounded-md shadow-xl mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Create Policy</h2>
      <form className="space-y-6">
        {/* User Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter User DID"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={fetchUserByDID}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Search
          </button>
        </div>

        {/* Insurance & Hospital */}
        <div className="flex gap-[1rem]">
          <select
            value={insuranceCompany}
            onChange={(e) => setInsuranceCompany(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Insurance Company</option>
            <option value="AIG">AIG</option>
            <option value="Jubilee">Jubilee</option>
          </select>

          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Hospital</option>
            <option value="Aga Khan">Aga Khan</option>
            <option value="Nairobi Hospital">Nairobi Hospital</option>
          </select>
        </div>

        {/* Amount & Premium */}
        <div className="flex gap-[1rem]">
          <div className="space-y-2">
            <label className="block text-gray-700">Policy Amount</label>
            <input
              type="number"
              value={policyAmount}
              onChange={(e) => setPolicyAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700">Premium</label>
            <input
              type="number"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Start & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
          <div className="space-y-1">
            <label className="block text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Preview Button */}
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="w-full py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Preview Policy
        </button>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold">Policy Preview</h2>
              {userDetails && <p>User: {userDetails.firstName} {userDetails.secondName}</p>}
              <p>Insurance Company: {insuranceCompany}</p>
              <p>Hospital: {hospital}</p>
              <p>Amount: {policyAmount}</p>
              <p>Premium: {premium}</p>
              <p>Start Date: {startDate}</p>
              <p>End Date: {endDate}</p>
              <button
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                onClick={handleCreatePolicy}
              >
                Confirm & Create
              </button>
              <button
                className="mt-4 px-4 py-2 bg-gray-400 text-white rounded-lg ml-2"
                onClick={() => setShowPreview(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePolicy;
