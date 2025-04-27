import React, { createContext, useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import DIDregisterABI from "../contracts/abis/DIDregister.json";
import InsuranceABI from "../contracts/abis/Insurance.json";

export const ContractContext = createContext();

// Load from environment variables
const DIDregisterAddress = process.env.REACT_APP_DID_REGISTER_CONTRACT_ADDRESS;
const InsuranceAddress = process.env.REACT_APP_INSURANCE_CONTRACT_ADDRESS;
const expectedNetworkId = process.env.REACT_APP_NETWORK_ID; // 84532 (Base Sepolia)
const expectedNetworkName = process.env.REACT_APP_NETWORK_NAME; // "Base Sepolia"

export const ContractProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [didRegisterContract, setDidRegisterContract] = useState(null);
  const [insuranceContract, setInsuranceContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to continue.");
        return;
      }

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const _provider = new BrowserProvider(window.ethereum);
        const network = await _provider.getNetwork();

        // Check if the user is on the correct network
        if (network.chainId.toString() !== expectedNetworkId) {
          alert(`Please switch MetaMask to the ${expectedNetworkName} network.`);
          return;
        }

        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();

        const _didRegisterContract = new Contract(
          DIDregisterAddress,
          DIDregisterABI,
          _signer
        );

        const _insuranceContract = new Contract(
          InsuranceAddress,
          InsuranceABI,
          _signer
        );

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setDidRegisterContract(_didRegisterContract);
        setInsuranceContract(_insuranceContract);
        console.log("Connected Account:", _account);
        console.log("DID Register Contract:", _didRegisterContract.address);
        console.log("Insurance Contract:", _insuranceContract.address);
      } catch (error) {
        console.error("MetaMask connection error:", error);
        
      }
    };

    init();
  }, []);

  return (
    <ContractContext.Provider
      value={{
        provider,
        signer,
        account,
        didRegisterContract,
        insuranceContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
