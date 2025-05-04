// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ClaimSettlement
 * @dev Handles settlement of medical insurance claims and transfers funds
 */
contract ClaimSettlement {
    address public owner;
    address public insurancePool;
    
    // Claim statuses
    enum ClaimStatus { 
        Submitted, 
        Approved, 
        Rejected, 
        Settled,
        Disputed
    }
    
    // Claim data structure
    struct Claim {
        uint256 claimId;
        string procedureId;
        address patientAddress;
        address hospitalAddress;
        uint256 claimAmount;
        uint256 approvedAmount;
        uint256 submissionTime;
        uint256 settlementTime;
        ClaimStatus status;
        string vcReference; // Reference to the verifiable credential
    }
    
    // Mapping from claim ID to Claim
    mapping(uint256 => Claim) public claims;
    
    // Counter for generating unique claim IDs
    uint256 private claimCounter;
    
    // Events
    event ClaimSubmitted(uint256 indexed claimId, address indexed patient, address indexed hospital, uint256 amount);
    event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount);
    event ClaimRejected(uint256 indexed claimId, string reason);
    event ClaimSettled(uint256 indexed claimId, address indexed recipient, uint256 amount);
    event ClaimDisputed(uint256 indexed claimId, address indexed disputedBy);
    event FundsDeposited(address indexed from, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    modifier onlyInsurance() {
        require(msg.sender == insurancePool, "Only the insurance pool can call this function");
        _;
    }
    
    /**
     * @dev Contract constructor
     * @param _insurancePool Address of the insurance pool
     */
    constructor(address _insurancePool) {
        owner = msg.sender;
        insurancePool = _insurancePool;
        claimCounter = 1;
    }
    
    /**
     * @dev Submit a new claim
     * @param _procedureId Identifier for the medical procedure
     * @param _hospitalAddress Address of the hospital that performed the procedure
     * @param _claimAmount Amount being claimed for reimbursement
     * @param _vcReference Reference to the verifiable credential proving the procedure
     * @return The ID of the newly submitted claim
     */
    function submitClaim(
        string memory _procedureId,
        address _hospitalAddress,
        uint256 _claimAmount,
        string memory _vcReference
    ) external returns (uint256) {
        uint256 claimId = claimCounter;
        claimCounter++;
        
        claims[claimId] = Claim({
            claimId: claimId,
            procedureId: _procedureId,
            patientAddress: msg.sender,
            hospitalAddress: _hospitalAddress,
            claimAmount: _claimAmount,
            approvedAmount: 0,
            submissionTime: block.timestamp,
            settlementTime: 0,
            status: ClaimStatus.Submitted,
            vcReference: _vcReference
        });
        
        emit ClaimSubmitted(claimId, msg.sender, _hospitalAddress, _claimAmount);
        
        return claimId;
    }
    
    /**
     * @dev Approve a claim (only callable by insurance)
     * @param _claimId ID of the claim to approve
     * @param _approvedAmount Amount approved for reimbursement
     */
    function approveClaim(uint256 _claimId, uint256 _approvedAmount) external onlyInsurance {
        Claim storage claim = claims[_claimId];
        
        require(claim.claimId == _claimId, "Claim does not exist");
        require(claim.status == ClaimStatus.Submitted, "Claim is not in submitted status");
        require(_approvedAmount <= claim.claimAmount, "Approved amount cannot exceed claim amount");
        
        claim.approvedAmount = _approvedAmount;
        claim.status = ClaimStatus.Approved;
        
        emit ClaimApproved(_claimId, _approvedAmount);
    }
    
    /**
     * @dev Reject a claim (only callable by insurance)
     * @param _claimId ID of the claim to reject
     * @param _reason Reason for rejection
     */
    function rejectClaim(uint256 _claimId, string memory _reason) external onlyInsurance {
        Claim storage claim = claims[_claimId];
        
        require(claim.claimId == _claimId, "Claim does not exist");
        require(claim.status == ClaimStatus.Submitted, "Claim is not in submitted status");
        
        claim.status = ClaimStatus.Rejected;
        
        emit ClaimRejected(_claimId, _reason);
    }
    
    /**
     * @dev Settle a claim and transfer funds (only callable by insurance)
     * @param _claimId ID of the claim to settle
     * @param _payHospital Whether to pay the hospital directly (true) or the patient (false)
     */
    function settleClaim(uint256 _claimId, bool _payHospital) external payable onlyInsurance {
        Claim storage claim = claims[_claimId];
        
        require(claim.claimId == _claimId, "Claim does not exist");
        require(claim.status == ClaimStatus.Approved, "Claim is not approved");
        require(msg.value == claim.approvedAmount, "Settlement amount must equal approved amount");
        
        address payable recipient;
        
        if (_payHospital) {
            recipient = payable(claim.hospitalAddress);
        } else {
            recipient = payable(claim.patientAddress);
        }
        
        claim.status = ClaimStatus.Settled;
        claim.settlementTime = block.timestamp;
        
        // Transfer funds to recipient
        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit ClaimSettled(_claimId, recipient, msg.value);
    }
    
    /**
     * @dev Dispute a claim (can be called by patient or hospital)
     * @param _claimId ID of the claim to dispute
     */
    function disputeClaim(uint256 _claimId) external {
        Claim storage claim = claims[_claimId];
        
        require(claim.claimId == _claimId, "Claim does not exist");
        require(
            msg.sender == claim.patientAddress || msg.sender == claim.hospitalAddress,
            "Only patient or hospital can dispute"
        );
        require(
            claim.status == ClaimStatus.Rejected || claim.status == ClaimStatus.Approved,
            "Can only dispute rejected or approved claims"
        );
        
        claim.status = ClaimStatus.Disputed;
        
        emit ClaimDisputed(_claimId, msg.sender);
    }
    
    /**
     * @dev Get claim details
     * @param _claimId ID of the claim to retrieve
     * @return Full claim details
     */
    function getClaim(uint256 _claimId) external view returns (Claim memory) {
        require(claims[_claimId].claimId == _claimId, "Claim does not exist");
        return claims[_claimId];
    }
    
    /**
     * @dev Deposit funds to the contract
     */
    function depositFunds() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    /**
     * @dev Update insurance pool address (only owner)
     * @param _newInsurancePool New insurance pool address
     */
    function updateInsurancePool(address _newInsurancePool) external onlyOwner {
        require(_newInsurancePool != address(0), "Invalid address");
        insurancePool = _newInsurancePool;
    }
    
    /**
     * @dev Transfer ownership (only owner)
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}