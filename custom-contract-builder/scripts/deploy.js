const hre = require("hardhat");

async function main() {
    // ✅ Ensure ethers is imported properly
    const { ethers } = hre;

    // Define sample data for contract deployment
    const shipmentId = "SHIP-001";
    const stageNames = ["Loading", "Customs", "In Transit", "Delivery"];
    const stageDocs = [
        ["Packing List", "Weight Certificate"],
        ["Customs Declaration", "Inspection Report"],
        ["Waybill"],
        ["Final Receipt"]
    ];
    
    const [deployer, signer1, signer2, infoProvider1, infoProvider2] = await ethers.getSigners();

    const stageSigners = [
        [signer1.address, signer2.address],  // Stage 1 signers
        [signer1.address],  // Stage 2 signers
        [signer2.address],  // Stage 3 signers
        [signer1.address, signer2.address]  // Stage 4 signers
    ];

    const stageInfoProviders = [
        [infoProvider1.address],  // Stage 1 info provider
        [infoProvider2.address],  // Stage 2 info provider
        [infoProvider1.address],  // Stage 3 info provider
        [infoProvider2.address]   // Stage 4 info provider
    ];

    console.log("Deploying Shipment contract...");

    // ✅ Use ethers from hre
    const Shipment = await ethers.getContractFactory("Shipment");
    const shipment = await Shipment.deploy(shipmentId, stageNames, stageDocs, stageSigners, stageInfoProviders);

    await shipment.waitForDeployment();

    console.log(`Shipment contract deployed to: ${shipment.target}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
