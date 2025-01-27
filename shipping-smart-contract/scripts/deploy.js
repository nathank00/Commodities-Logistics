const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying ShipmentManager contract...");

    // Get contract factory
    const ShipmentManager = await ethers.getContractFactory("ShipmentManager");

    // Deploy contract
    const shipmentManager = await ShipmentManager.deploy();

    // Wait for deployment to finish
    await shipmentManager.waitForDeployment();

    // Get contract address
    const contractAddress = await shipmentManager.getAddress();

    console.log(`ShipmentManager deployed to: ${contractAddress}`);
}

// Execute deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
