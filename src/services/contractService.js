import Web3 from "web3";
import DIDregisterABI from "../contracts/abis/DIDregister.json";
//import DIDregisterABI from "../contracts/abis/DIDregister.json";
import InsuranceABI from "../contracts/abis/Insurance.json";

const web3 = new Web3(window.ethereum);  // Use MetaMask's provider

// Contract Addresses - Replace with actual deployed addresses
const DIDregisterAddress = "0x21ba87e1280beb29a55ac21cffa948eca9f087c8"; // Already provided
const InsuranceAddress = "0x11d87b3e9f41443438cb88e9b40a31f7cf4fcab3";  // Insurance contract address 

// Initialize contracts
const DIDregisterContract = new web3.eth.Contract(DIDregisterABI, DIDregisterAddress);
const InsuranceContract = new web3.eth.Contract(InsuranceABI, InsuranceAddress);

export const getDID = async (address) => {
  try {
    const did = await DIDregisterContract.methods.getDID(address).call();
    return did;
  } catch (error) {
    console.error("Error fetching DID:", error);
    return null;
  }
};

export const createInsurancePolicy = async (address, policyData) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await InsuranceContract.methods.createPolicy(policyData).send({ from: accounts[0] });
  } catch (error) {
    console.error("Error creating insurance policy:", error);
  }
};


