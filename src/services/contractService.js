import Web3 from "web3";
import DIDregisterABI from "../contracts/abis/DIDregister.json";
import InsuranceABI from "../contracts/abis/Insurance.json";

// Initialize Web3 using MetaMask provider
const web3 = new Web3(window.ethereum);

// Read contract addresses from environment variables
const DIDregisterAddress = process.env.REACT_APP_DID_REGISTER_CONTRACT_ADDRESS;
const InsuranceAddress = process.env.REACT_APP_INSURANCE_CONTRACT_ADDRESS;

// Initialize contract instances
const DIDregisterContract = new web3.eth.Contract(DIDregisterABI, DIDregisterAddress);
const InsuranceContract = new web3.eth.Contract(InsuranceABI, InsuranceAddress);

// Fetch a DID associated with an Ethereum address
export const getDID = async (address) => {
  try {
    const did = await DIDregisterContract.methods.getDID(address).call();
    return did;
  } catch (error) {
    console.error("Error fetching DID:", error);
    return null;
  }
};

// Create a new insurance policy
export const createInsurancePolicy = async (policyData) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await InsuranceContract.methods.createPolicy(policyData).send({ from: accounts[0] });
  } catch (error) {
    console.error("Error creating insurance policy:", error);
  }
};
