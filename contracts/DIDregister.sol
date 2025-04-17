// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DIDregister {
    struct DID {
        string did;
        bool isActive;
        uint256 policyId;
    }

    mapping(address => DID) private dids;
    mapping(string => address) private didToAddress;
    
    address public insuranceContract;
    address public admin;
    
    event DIDCreated(address indexed user, string did, uint256 policyId);
    event DIDDeactivated(address indexed user, string did);
    event InsuranceContractUpdated(address indexed newInsuranceContract);
    
    modifier onlyInsuranceContract() {
        require(msg.sender == insuranceContract, "Only insurance contract can call");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }
    
    modifier onlyUniqueDID(string memory _did) {
        require(didToAddress[_did] == address(0), "DID already registered");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }

    function registerDID(
        address _policyholder, 
        string memory _did, 
        uint256 _policyId
    ) external onlyInsuranceContract onlyUniqueDID(_did) {
        require(bytes(_did).length > 0, "DID cannot be empty");
        require(!dids[_policyholder].isActive, "DID already exists");

        dids[_policyholder] = DID(_did, true, _policyId);
        didToAddress[_did] = _policyholder;

        emit DIDCreated(_policyholder, _did, _policyId);
    }
    function registerHospitalDID(
    address _hospital,
    string memory _did
) external onlyAdmin onlyUniqueDID(_did) {
    require(bytes(_did).length > 0, "DID cannot be empty");
    require(!dids[_hospital].isActive, "DID already exists");

    dids[_hospital] = DID(_did, true, 0); // 0 as dummy policy ID
    didToAddress[_did] = _hospital;

    emit DIDCreated(_hospital, _did, 0);
}


    function verifyDID(string memory _did) public view returns (bool) {
        address holder = didToAddress[_did];
        if (holder == address(0)) return false;
        return dids[holder].isActive;
    }

    function getDIDDetails(address _holder) public view returns (
        string memory did,
        bool isActive,
        uint256 policyId
    ) {
        require(dids[_holder].isActive, "No active DID found");
        DID memory didInfo = dids[_holder];
        return (didInfo.did, didInfo.isActive, didInfo.policyId);
    }

    function deactivateDID(address _holder) external onlyAdmin {
        require(dids[_holder].isActive, "DID not active");
        string memory did = dids[_holder].did;
        dids[_holder].isActive = false;
        emit DIDDeactivated(_holder, did);
    }

    function setInsuranceContract(address _insuranceContract) external onlyAdmin {
        require(_insuranceContract != address(0), "Invalid insurance contract");
        insuranceContract = _insuranceContract;
        emit InsuranceContractUpdated(_insuranceContract);
    }
}