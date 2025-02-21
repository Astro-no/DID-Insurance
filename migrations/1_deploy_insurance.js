const Insurance = artifacts.require("Insurance");
const DIDregister = artifacts.require("DIDregister");

module.exports = async function (deployer, network, accounts) {
    try {
        // First deploy DIDregister
        await deployer.deploy(DIDregister);
        const didRegister = await DIDregister.deployed();
        console.log("DIDregister deployed at:", didRegister.address);

        // Deploy Insurance contract with DIDregister address
        await deployer.deploy(Insurance, didRegister.address);
        const insurance = await Insurance.deployed();
        console.log("Insurance deployed at:", insurance.address);

        // Set Insurance contract address in DIDregister
        await didRegister.setInsuranceContract(insurance.address);
        console.log("DIDregister updated with Insurance address");

    } catch (error) {
        console.error("Deployment failed:", error);
    }
};