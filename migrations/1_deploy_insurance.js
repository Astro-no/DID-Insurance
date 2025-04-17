const Insurance = artifacts.require("Insurance");
const DIDregister = artifacts.require("DIDregister");

module.exports = async function (deployer, network, accounts) {
    try {
        // Deploy with retry
        await deployWithRetry(async () => {
            // First deploy DIDregister
            await deployer.deploy(DIDregister);
            const didRegister = await DIDregister.deployed();
            console.log("DIDregister deployed at:", didRegister.address);
            
            return didRegister;
        });

        const didRegister = await DIDregister.deployed();
        
        // Wait a bit before next deployment to avoid rate limiting
        if (network === "sepolia") {
            console.log("Waiting 20 seconds before next deployment...");
            await new Promise(resolve => setTimeout(resolve, 20000));
        }
        
        await deployWithRetry(async () => {
            // Deploy Insurance contract with DIDregister address
            await deployer.deploy(Insurance, didRegister.address);
            const insurance = await Insurance.deployed();
            console.log("Insurance deployed at:", insurance.address);
            
            return insurance;
        });
        
        const insurance = await Insurance.deployed();
        
        // Wait again before setting the insurance contract
        if (network === "sepolia") {
            console.log("Waiting 20 seconds before updating DIDregister...");
            await new Promise(resolve => setTimeout(resolve, 20000));
        }
        
        await deployWithRetry(async () => {
            // Set Insurance contract address in DIDregister
            await didRegister.setInsuranceContract(insurance.address);
            console.log("DIDregister updated with Insurance address");
        });

    } catch (error) {
        console.error("Deployment failed:", error);
    }
};

async function deployWithRetry(deployFunc, maxAttempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await deployFunc();
        } catch (error) {
            console.log(`Attempt ${attempt} failed:`, error.message);
            lastError = error;
            
            if (attempt < maxAttempts) {
                const delay = attempt * 15000; // 15s, 30s, 45s backoff
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}