// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.20;

import "./DIDregister.sol";
import "./ClaimSettlement.sol";

contract Insurance {
    struct Policy {
        address holder;
        uint256 amount;
        uint256 premium;
        uint256 startDate;
        uint256 endDate;
        PolicyStatus status;
        string holderDID;
        string insuranceCompanyName;
        string hospitalName;
    }

    struct Procedure {
        string name;
        uint256 timestamp;
        bool verified;
        address hospital;
    }

    enum PolicyStatus {
        Active,
        Inactive,
        Claimed
    }

    address public admin;
    address public insuranceCompany;
    mapping(address => bool) public authorizedHospitals;
    
    DIDregister public immutable didRegistry;
    ClaimSettlement public claimSettlement;
    
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Procedure[]) public policyProcedures;
    mapping(address => uint256[]) public userPolicies;
    mapping(address => uint256) public claimHistory;
    
    uint256 private nextPolicyId;

    event PolicyCreated(address indexed holder, uint256 indexed policyId, uint256 startDate, uint256 endDate);
    event ClaimMade(uint256 indexed policyId, address indexed holder, uint256 claimAmt);
    event ClaimAccepted(uint256 indexed policyId, address indexed holder, uint256 claimAmt);
    event ClaimRejected(uint256 indexed policyId, address indexed holder);
    event ProcedureRecorded(uint256 indexed policyId, address indexed hospital, string procedureName);
    event HospitalAuthorized(address indexed hospital);
    event HospitalDeauthorized(address indexed hospital);
    event ClaimSettlementContractSet(address indexed claimSettlementAddress);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }

    modifier onlyInsuranceCompany() {
        require(msg.sender == insuranceCompany, "Only insurance company can call");
        _;
    }

    modifier onlyHospital() {
        require(authorizedHospitals[msg.sender], "Only authorized hospital can call");
        _;
    }

    modifier validPolicy(uint256 _policyId) {
        require(_policyId < nextPolicyId, "Invalid policy ID");
        _;
    }

    constructor(address _didRegistryAddress) {
        require(_didRegistryAddress != address(0), "Invalid DID registry");
        didRegistry = DIDregister(_didRegistryAddress);
        admin = msg.sender;
    }

    // NEW FUNCTION: Set the ClaimSettlement contract address
    function setClaimSettlementContract(address _claimSettlementAddress) external onlyAdmin {
        require(_claimSettlementAddress != address(0), "Invalid address");
        claimSettlement = ClaimSettlement(_claimSettlementAddress);
        emit ClaimSettlementContractSet(_claimSettlementAddress);
    }

    function setInsuranceCompany(address _insuranceCompany) external onlyAdmin {
        require(_insuranceCompany != address(0), "Invalid address");
        insuranceCompany = _insuranceCompany;
    }

    function authorizeHospital(address _hospital) external onlyAdmin {
        require(_hospital != address(0), "Invalid address");
        authorizedHospitals[_hospital] = true;
        emit HospitalAuthorized(_hospital);
    }

    function deauthorizeHospital(address _hospital) external onlyAdmin {
        authorizedHospitals[_hospital] = false;
        emit HospitalDeauthorized(_hospital);
    }

    function createPolicy(
        string memory _did,
        uint256 _amount,
        uint256 _premium,
        uint256 _endDate
    ) external onlyInsuranceCompany returns (uint256) {
        require(_endDate > block.timestamp, "Invalid end date");
        require(_premium > 0, "Invalid premium");
        require(_amount > 0, "Invalid amount");
        
        uint256 policyId = nextPolicyId++;
        
        didRegistry.registerDID(msg.sender, _did, policyId);
        
        policies[policyId] = Policy({
            holder: msg.sender,
            amount: _amount,
            premium: _premium,
            startDate: block.timestamp,
            endDate: _endDate,
            status: PolicyStatus.Active,
            holderDID: _did,
            insuranceCompanyName: "",
            hospitalName: ""
        });
        
        userPolicies[msg.sender].push(policyId);
        
        emit PolicyCreated(msg.sender, policyId, block.timestamp, _endDate);
        return policyId;
    }

    function createIns(
        string memory _did,
        string memory _insuranceCompanyName,
        string memory _hospitalName,
        uint256 _amount,
        uint256 _premium,
        uint256 _startDate,
        uint256 _endDate
    ) external returns (uint256) {
        require(_endDate > _startDate, "End date must be after start date");
        require(_premium > 0, "Invalid premium");
        require(_amount > 0, "Invalid amount");
        
        uint256 policyId = nextPolicyId++;
        
        // Try to register DID if it doesn't exist
        if (!didRegistry.verifyDID(_did)) {
            didRegistry.registerDID(msg.sender, _did, policyId);
        }
        
        policies[policyId] = Policy({
            holder: msg.sender,
            amount: _amount,
            premium: _premium,
            startDate: _startDate,
            endDate: _endDate,
            status: PolicyStatus.Active,
            holderDID: _did,
            insuranceCompanyName: _insuranceCompanyName,
            hospitalName: _hospitalName
        });
        
        userPolicies[msg.sender].push(policyId);
        
        emit PolicyCreated(msg.sender, policyId, _startDate, _endDate);
        return policyId;
    }

    function makeClaim(uint256 _policyId, uint256 _claimAmt) external validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(msg.sender == policy.holder, "Not policy holder");
        require(didRegistry.verifyDID(policy.holderDID), "Invalid DID");
        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(_claimAmt > 0 && _claimAmt <= policy.amount, "Invalid claim amount");
        require(
            block.timestamp >= policy.startDate && 
            block.timestamp <= policy.endDate, 
            "Outside policy period"
        );

        policy.status = PolicyStatus.Claimed;
        claimHistory[msg.sender] += _claimAmt;

        emit ClaimMade(_policyId, msg.sender, _claimAmt);
    }

    function recordProcedure(
        uint256 _policyId,
        string memory _name
    ) external onlyHospital validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Claimed, "Policy not claimed");
        require(bytes(_name).length > 0, "Invalid procedure name");
        require(
            block.timestamp >= policy.startDate && 
            block.timestamp <= policy.endDate, 
            "Outside policy period"
        );

        // Store the hospital address that recorded the procedure
        // This is the address connected via MetaMask
        policyProcedures[_policyId].push(Procedure({
            name: _name,
            timestamp: block.timestamp,
            verified: true,
            hospital: msg.sender // Using the connected MetaMask address
        }));

        emit ProcedureRecorded(_policyId, msg.sender, _name);
    }

    // MODIFIED FUNCTION: Now uses ClaimSettlement contract
    function acceptClaim(uint256 _policyId) external onlyInsuranceCompany validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Claimed, "No active claim");
        require(address(claimSettlement) != address(0), "ClaimSettlement not set");

        // Get the procedures associated with this policy
        Procedure[] memory procedures = policyProcedures[_policyId];
        require(procedures.length > 0, "No procedures recorded for this claim");
        
        // Get the hospital address from the last recorded procedure
        address hospitalAddress = procedures[procedures.length - 1].hospital;
        require(hospitalAddress != address(0), "Invalid hospital address");
        
        // Update policy status
        policy.status = PolicyStatus.Inactive;
        
        // Create a claim ID in ClaimSettlement using the patient's DID as reference
        uint256 claimId = claimSettlement.submitClaim(
            procedures[procedures.length - 1].name, // Use procedure name as procedureId
            hospitalAddress, // Use the hospital address that recorded the procedure
            policy.amount,
            policy.holderDID // Use patient DID as VC reference
        );
        
        // Approve the claim in ClaimSettlement
        claimSettlement.approveClaim(claimId, policy.amount);
        
        // Send funds to ClaimSettlement and settle the claim, paying the hospital
        claimSettlement.settleClaim{value: policy.amount}(claimId, true);
        
        emit ClaimAccepted(_policyId, policy.holder, policy.amount);
    }

    function rejectClaim(uint256 _policyId) external onlyInsuranceCompany validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Claimed, "No active claim");

        policy.status = PolicyStatus.Active;
        
        emit ClaimRejected(_policyId, policy.holder);
    }

    function getPolicyStatus(uint256 _policyId) external view validPolicy(_policyId) returns (PolicyStatus) {
        return policies[_policyId].status;
    }

    function getUserPolicies(address _user) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }

    function getProcedures(uint256 _policyId) external view validPolicy(_policyId) returns (Procedure[] memory) {
        Policy storage policy = policies[_policyId];
        require(
            msg.sender == policy.holder || 
            msg.sender == admin || 
            msg.sender == insuranceCompany || 
            authorizedHospitals[msg.sender],
            "Unauthorized"
        );
        return policyProcedures[_policyId];
    }

    function getPolicyDetails(uint256 _policyId) external view validPolicy(_policyId) returns (
        address holder,
        uint256 amount,
        uint256 premium,
        uint256 startDate,
        uint256 endDate,
        PolicyStatus status,
        string memory holderDID,
        string memory insuranceCompanyName,
        string memory hospitalName
    ) {
        Policy storage policy = policies[_policyId];
        return (
            policy.holder,
            policy.amount,
            policy.premium,
            policy.startDate,
            policy.endDate,
            policy.status,
            policy.holderDID,
            policy.insuranceCompanyName,
            policy.hospitalName
        );
    }

    receive() external payable {}
}