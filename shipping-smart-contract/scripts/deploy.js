const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying ShipmentManager contract...");

    const ShipmentManager = await ethers.getContractFactory("ShipmentManager");
    const shipmentManager = await ShipmentManager.deploy();
    await shipmentManager.waitForDeployment();

    const contractAddress = await shipmentManager.getAddress();
    console.log(`ShipmentManager deployed to: ${contractAddress}`);

    // Test accounts
    const [admin, signer1, signer2, infoProvider] = await ethers.getSigners();

    // Admin assigns roles and creates a shipment
    await shipmentManager.createShipment(
        "SHIP46", 
        [signer1.address, signer2.address], // Signers
        [infoProvider.address] // Info Providers
    );

    console.log(`Shipment SHIP123 created.`);
    console.log(`Assigned SIGNER_ROLE to: ${signer1.address}, ${signer2.address}`);
    console.log(`Assigned INFO_PROVIDER_ROLE to: ${infoProvider.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
