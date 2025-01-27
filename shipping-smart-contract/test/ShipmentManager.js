const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipmentManager", function () {
    let ShipmentManager, shipmentManager;
    let owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        ShipmentManager = await ethers.getContractFactory("ShipmentManager");
        shipmentManager = await ShipmentManager.deploy();
        await shipmentManager.waitForDeployment();
    });

    it("Should create a new shipment with CREATED status", async function () {
        await shipmentManager.createShipment("SHIP123");
        expect(Number(await shipmentManager.getShipmentStage("SHIP123"))).to.equal(0); // Convert BigInt to Number
    });

    it("Should advance the shipment stage to LOADED", async function () {
        await shipmentManager.createShipment("SHIP123");
        await shipmentManager.advanceStage("SHIP123");
        expect(Number(await shipmentManager.getShipmentStage("SHIP123"))).to.equal(1); // Convert BigInt to Number
    });

    it("Should not allow advancing beyond DELIVERED", async function () {
        await shipmentManager.createShipment("SHIP123");
        await shipmentManager.advanceStage("SHIP123"); // LOADED
        await shipmentManager.advanceStage("SHIP123"); // IN_TRANSIT
        await shipmentManager.advanceStage("SHIP123"); // DELIVERED
        
        await expect(shipmentManager.advanceStage("SHIP123")).to.be.revertedWith(
            "Shipment already delivered"
        );
    });
});
