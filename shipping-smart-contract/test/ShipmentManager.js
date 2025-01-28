const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipmentManager", function () {
    let ShipmentManager, shipmentManager;
    let admin, signer1, signer2, infoProvider, unauthorizedUser;

    before(async function () {
        [admin, signer1, signer2, infoProvider, unauthorizedUser] = await ethers.getSigners();

        ShipmentManager = await ethers.getContractFactory("ShipmentManager");
        shipmentManager = await ShipmentManager.deploy();
        await shipmentManager.waitForDeployment();

        // ✅ Ensure admin is explicitly assigned ADMIN_ROLE
        const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
        await shipmentManager.grantRole(ADMIN_ROLE, admin.address);
    });

    it("Should verify the admin has ADMIN_ROLE before creating a shipment", async function () {
        const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

        const hasAdminRole = await shipmentManager.hasRole(ADMIN_ROLE, admin.address);
        console.log("Admin has ADMIN_ROLE:", hasAdminRole);

        expect(hasAdminRole).to.be.true;
    });

    it("Should prevent anyone from granting ADMIN_ROLE", async function () {
        const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

        await expect(
            shipmentManager.connect(signer1).grantRole(ADMIN_ROLE, signer1.address)
        ).to.be.revertedWithCustomError(shipmentManager, "AccessControlUnauthorizedAccount");
    });

    it("Should allow the admin to create a shipment and assign roles", async function () {
        const shipmentID = "SHIP123";

        await shipmentManager.createShipment(
            shipmentID,
            [signer1.address, signer2.address], // Signers
            [infoProvider.address] // Info Providers
        );

        const stage = await shipmentManager.getShipmentStage(shipmentID);
        expect(stage).to.equal(0); // CREATED stage

        // Check if assigned roles are correct
        const SIGNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SIGNER_ROLE"));
        const INFO_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INFO_PROVIDER_ROLE"));

        expect(await shipmentManager.hasRole(SIGNER_ROLE, signer1.address)).to.be.true;
        expect(await shipmentManager.hasRole(SIGNER_ROLE, signer2.address)).to.be.true;
        expect(await shipmentManager.hasRole(INFO_ROLE, infoProvider.address)).to.be.true;
    });

    it("Should prevent non-admins from creating shipments", async function () {
        await expect(
            shipmentManager.connect(signer1).createShipment(
                "SHIP456",
                [signer1.address, signer2.address],
                [infoProvider.address]
            )
        ).to.be.revertedWithCustomError(shipmentManager, "AccessControlUnauthorizedAccount");
    });

    it("Should allow an info provider to upload a document", async function () {
        const shipmentID = "SHIP123";
        await shipmentManager.connect(infoProvider).uploadDocument(shipmentID);
    });

    it("Should prevent a non-info provider from uploading a document", async function () {
        const shipmentID = "SHIP123";
        await expect(
            shipmentManager.connect(signer1).uploadDocument(shipmentID)
        ).to.be.revertedWithCustomError(shipmentManager, "AccessControlUnauthorizedAccount");
    });

    it("Should allow all signers to approve a stage and move it forward", async function () {
        const shipmentID = "SHIP123";

        await shipmentManager.connect(signer1).approveStage(shipmentID);
        await shipmentManager.connect(signer2).approveStage(shipmentID);

        const stage = await shipmentManager.getShipmentStage(shipmentID);
        expect(stage).to.equal(1); // LOADED stage
    });

    it("Should prevent a non-signer from approving a stage", async function () {
        const shipmentID = "SHIP123";
        await expect(
            shipmentManager.connect(infoProvider).approveStage(shipmentID)
        ).to.be.revertedWithCustomError(shipmentManager, "AccessControlUnauthorizedAccount");
    });

    it("Should only advance the stage when all signers approve", async function () {
        const shipmentID = "SHIP123";

        await shipmentManager.connect(signer1).approveStage(shipmentID);

        // The stage should not advance yet because signer2 hasn't approved
        const stageBefore = await shipmentManager.getShipmentStage(shipmentID);
        expect(stageBefore).to.equal(1); // Still LOADED

        await shipmentManager.connect(signer2).approveStage(shipmentID);

        // Now it should have advanced
        const stageAfter = await shipmentManager.getShipmentStage(shipmentID);
        expect(stageAfter).to.equal(2); // IN_TRANSIT
    });

    it("Should not allow advancing past the DELIVERED stage", async function () {
        const shipmentID = "SHIP123";

        await shipmentManager.connect(signer1).approveStage(shipmentID);
        await shipmentManager.connect(signer2).approveStage(shipmentID);

        await shipmentManager.connect(signer1).approveStage(shipmentID);
        await shipmentManager.connect(signer2).approveStage(shipmentID);

        await shipmentManager.connect(signer1).approveStage(shipmentID);
        await shipmentManager.connect(signer2).approveStage(shipmentID);

        // Now the shipment should be at DELIVERED (3)
        const finalStage = await shipmentManager.getShipmentStage(shipmentID);
        expect(finalStage).to.equal(3);

        // Any further approvals should fail
        await expect(
            shipmentManager.connect(signer1).approveStage(shipmentID)
        ).to.be.revertedWith("Shipment already delivered");
    });
});
