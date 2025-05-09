# DID-based Insurance Verification System

## Introduction

The insurance industry is vulnerable to various forms of fraud, such as applicants submitting false identities, double-claiming benefits, or filing fraudulent claims on behalf of ineligible parties. This project introduces a Decentralized Identifier (DID) and Verifiable Credentials (VCs)-based system combined with blockchain technology to reduce insurance fraud. By issuing, verifying, and recording claims and identity credentials on the blockchain, this system strengthens trust, transparency, and interoperability across stakeholders—policyholders, hospitals, and insurers.

## Objective

The objective of this project is to reduce insurance fraud by integrating DIDs and Verifiable Credentials with blockchain. It focuses on enhancing the integrity and automation of identity verification, claim submission, and medical procedure validation. The system ensures secure data exchange, prevents multiple claims on the same procedure, and verifies the authenticity of all parties involved—streamlining claims processing while improving trust and efficiency.

## Users in the system
The project focuses on:

Policyholders: Individuals who register with a DID and receive digital credentials linked to their identity and insurance entitlements.

Hospitals: Authorized to record treatment details and issue Verifiable Credentials for medical procedures.

Administrator/ Insurance Companies: Use the system to verify identities, validate claims against credentials, and detect fraudulent behavior across claim histories.

The scope of this project includes people applying for medical insurance, insurance companies, and hospitals involved in the medical history of the patient.

## Smart Contracts

Smart contracts facilitate trusted automation and accountability. In this system, smart contracts:

1. Record and validate insurance policies.

2. Link policyholders' DIDs with insurance entitlements.

3. Manage medical claims submitted through Verifiable Credentials.

4. Automatically enforce rules (e.g., reject duplicate claims).

5. Enable permissionless yet secure access to validated data for insurers and hospitals.

This decentralized structure ensures fraud detection.

## Code

The smart contracts code is written in Solidity and can be found in the 'contracts' directory in this repository. They includes modules for:

1. DID registration and verification.

2. Policy issuance and linkage to DIDs.

3. Hospital credential issuance for medical procedures.

4. Claim submission using Verifiable Credentials.

5. Automated claim status updates and auditing.

## Installation

Start off with cloning this repository. Initialize npm and start local development server.

Also run node backend/server.js to start the backend. 

You can compile and deploy the contracts locally or on remix and copy the ABI's.


## Conclusion

This project highlights how DIDs, Verifiable Credentials, and blockchain can be integrated to build a secure and fraud-resistant insurance ecosystem. By removing reliance on paper-based and siloed systems, it offers a modern approach to identity management, claims verification, and interoperability across stakeholders. The result is a transparent, efficient, and trustworthy infrastructure for managing insurance claims and combating fraud.

Feel free to contribute :)


