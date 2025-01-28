const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Shipment Contract", function () {
    let Shipment, shipment;
    let owner, signer1, signer2, infoProvider1, infoProvider2;

    beforeEach(async function () {
        [owner, signer1, signer2, infoProvider1, infoProvider2] = await ethers.getSigners();

        const shipmentId = "SHIP-001";
        const stageNames = ["Loading", "Customs", "In Transit", "Delivery"];
        const stageDocs = [
            ["Packing List", "Weight Certificate"],
            ["Customs Declaration", "Inspection Report"],
            ["Waybill"],
            ["Final Receipt", "Customs Approval"]
        ];
        
        const stageSigners = [
            [signer1.address, signer2.address],  // Stage 1 signers
            [signer1.address],  // Stage 2 signers
            [signer2.address],  // Stage 3 signers
            [signer1.address, signer2.address]  // Stage 4 (Final) signers
        ];

        const stageInfoProviders = [
            [infoProvider1.address],  // Stage 1 info provider
            [infoProvider2.address],  // Stage 2 info provider
            [infoProvider1.address],  // Stage 3 info provider
            [infoProvider2.address]   // Stage 4 (Final) info provider ✅ FIXED
        ];

        Shipment = await ethers.getContractFactory("Shipment");
        shipment = await Shipment.deploy(shipmentId, stageNames, stageDocs, stageSigners, stageInfoProviders);
        await shipment.waitForDeployment();
    });

    it("Should deploy the contract with the correct shipment ID", async function () {
        expect(await shipment.shipmentId()).to.equal("SHIP-001");
    });

    it("Should start at stage 0", async function () {
        expect(await shipment.getCurrentStage()).to.equal(0);
    });

    it("Should allow an info provider to upload a document", async function () {
        await shipment.connect(infoProvider1).uploadDocument(0, "Packing List");
        const uploadedDocs = await shipment.getUploadedDocuments(0);
        expect(uploadedDocs).to.include("Packing List");
    });

    it("Should prevent a non-info provider from uploading a document", async function () {
        await expect(
            shipment.connect(signer1).uploadDocument(0, "Packing List")
        ).to.be.revertedWith("Not assigned as an info provider");
    });

    it("Should not allow signers to approve a stage before all documents are uploaded", async function () {
        await expect(
            shipment.connect(signer1).approveStage(0)
        ).to.be.revertedWith("All required documents must be uploaded before approval");
    });

    it("Should allow signers to approve a stage after all documents are uploaded", async function () {
        await shipment.connect(infoProvider1).uploadDocument(0, "Packing List");
        await shipment.connect(infoProvider1).uploadDocument(0, "Weight Certificate");

        await shipment.connect(signer1).approveStage(0);
        await shipment.connect(signer2).approveStage(0);

        expect(await shipment.getCurrentStage()).to.equal(1);
    });

    it("Should not allow duplicate signer approvals", async function () {
        await shipment.connect(infoProvider1).uploadDocument(0, "Packing List");
        await shipment.connect(infoProvider1).uploadDocument(0, "Weight Certificate");

        await shipment.connect(signer1).approveStage(0);
        await expect(
            shipment.connect(signer1).approveStage(0)
        ).to.be.revertedWith("Already approved this stage");
    });

    it("Should allow signers to approve the last stage only after all documents are uploaded", async function () {
        // ✅ Ensure correct info providers are uploading documents for stage 4
        await shipment.connect(infoProvider2).uploadDocument(3, "Final Receipt");
        await shipment.connect(infoProvider2).uploadDocument(3, "Customs Approval");

        await shipment.connect(signer1).approveStage(3);
        await shipment.connect(signer2).approveStage(3);

        expect(await shipment.isFinalized()).to.be.true;
    });

    it("Should finalize the shipment only when all signers approve the last stage", async function () {
        // ✅ Ensure correct info providers are uploading documents for stage 4
        await shipment.connect(infoProvider2).uploadDocument(3, "Final Receipt");
        await shipment.connect(infoProvider2).uploadDocument(3, "Customs Approval");

        expect(await shipment.isFinalized()).to.be.false;

        await shipment.connect(signer1).approveStage(3);
        expect(await shipment.isFinalized()).to.be.false;

        await shipment.connect(signer2).approveStage(3);
        expect(await shipment.isFinalized()).to.be.true;
    });

    it("Should prevent approvals after finalization", async function () {
        // ✅ Ensure correct info providers are uploading documents for stage 4
        await shipment.connect(infoProvider2).uploadDocument(3, "Final Receipt");
        await shipment.connect(infoProvider2).uploadDocument(3, "Customs Approval");

        await shipment.connect(signer1).approveStage(3);
        await shipment.connect(signer2).approveStage(3);
        
        expect(await shipment.isFinalized()).to.be.true;

        await expect(
            shipment.connect(signer1).approveStage(3)
        ).to.be.revertedWith("Shipment is finalized");
    });

    it("Debug: Check assigned info providers for last stage", async function () {
        const lastStageProviders = await shipment.getStageInfoProviders(3);
        console.log("Info Providers for last stage:", lastStageProviders);
        
        expect(lastStageProviders).to.include(infoProvider2.address);
    });
    
    it("Debug: Verify infoProvider2 address", async function () {
        console.log("infoProvider2 Address (from test):", infoProvider2.address);
    });

    it("Debug: Log info provider on document upload attempt", async function () {
        await expect(
            shipment.connect(infoProvider2).uploadDocument(3, "Final Receipt")
        ).to.emit(shipment, "DebugInfoProvider")
        .withArgs(infoProvider2.address, await shipment.getStageInfoProviders(3));
    });
    
    
});
