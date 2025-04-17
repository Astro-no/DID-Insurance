import React, { createContext, useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import DIDregisterABI from "../contracts/abis/DIDregister.json";
import InsuranceABI from "../contracts/abis/Insurance.json";

export const ContractContext = createContext();

const didRegisterAddress = "0x21bA87E1280beb29a55ac21CfFA948eCa9F087C8";
const insuranceAddress = "0x11d87b3e9f41443438cb88e9b40a31f7cf4fcab3";

export const ContractProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [didRegisterContract, setDidRegisterContract] = useState(null);
  const [insuranceContract, setInsuranceContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          
          const _provider = new BrowserProvider(window.ethereum);
          const _signer = await _provider.getSigner();
          const _account = await _signer.getAddress();

          const _didRegister = new Contract(
            didRegisterAddress,
            DIDregisterABI,
            _signer
          );

          const _insurance = new Contract(
            insuranceAddress,
            InsuranceABI,
            _signer
          );

          setProvider(_provider);
          setSigner(_signer);
          setAccount(_account);
          setDidRegisterContract(_didRegister);
          setInsuranceContract(_insurance);
        } catch (error) {
          console.error("MetaMask connection error:", error);
        }
      } else {
        alert("Please install MetaMask.");
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
