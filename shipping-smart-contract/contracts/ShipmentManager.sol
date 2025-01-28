// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ShipmentManager is AccessControl {
    // Define role constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    bytes32 public constant INFO_PROVIDER_ROLE = keccak256("INFO_PROVIDER_ROLE");

    // Define shipment stages
    enum ShipmentStage { CREATED, LOADED, IN_TRANSIT, DELIVERED }

    struct Shipment {
        string shipmentId;
        address owner;
        ShipmentStage stage;
        bool[] documentUploaded;  // Tracks if required documents are uploaded for each stage
        mapping(address => bool) hasSigned;  // Tracks if a signer has approved
        uint256 totalSigners;  // Number of signers for this stage
        uint256 approvals;  // Number of approvals received
    }

    mapping(string => Shipment) private shipments;
    mapping(string => address[]) private signers;  // Signers per shipment stage
    mapping(string => address[]) private infoProviders;  // Info providers per shipment stage

    event ShipmentCreated(string shipmentId, address createdBy);
    event DocumentUploaded(string shipmentId, address uploadedBy);
    event StageApproved(string shipmentId, ShipmentStage newStage, address approvedBy);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // ✅ Gives deployer full control
        _grantRole(ADMIN_ROLE, msg.sender); // ✅ Explicitly grants `ADMIN_ROLE` to deployer
    }

    /**
     * @dev Admin creates a new shipment and assigns signers & info providers.
     */
    function createShipment(string memory _shipmentId, address[] memory _signers, address[] memory _infoProviders) public onlyRole(ADMIN_ROLE) {
        require(shipments[_shipmentId].owner == address(0), "Shipment already exists");

        Shipment storage shipment = shipments[_shipmentId];
        shipment.shipmentId = _shipmentId;
        shipment.owner = msg.sender;
        shipment.stage = ShipmentStage.CREATED;
        shipment.totalSigners = _signers.length;
        shipment.approvals = 0;

        // ✅ Use `_grantRole()` instead of `grantRole()` (avoids permission issues)
        for (uint i = 0; i < _signers.length; i++) {
            _grantRole(SIGNER_ROLE, _signers[i]);
            signers[_shipmentId].push(_signers[i]);
        }
        for (uint i = 0; i < _infoProviders.length; i++) {
            _grantRole(INFO_PROVIDER_ROLE, _infoProviders[i]);
            infoProviders[_shipmentId].push(_infoProviders[i]);
        }

        emit ShipmentCreated(_shipmentId, msg.sender);
    }

    /**
     * @dev Info provider uploads a required document for the current stage.
     */
    function uploadDocument(string memory _shipmentId) public onlyRole(INFO_PROVIDER_ROLE) {
        require(shipments[_shipmentId].owner != address(0), "Shipment does not exist");

        emit DocumentUploaded(_shipmentId, msg.sender);
    }

    /**
     * @dev Signer approves a stage (all signers must approve to move forward).
     */
    function approveStage(string memory _shipmentId) public onlyRole(SIGNER_ROLE) {
        Shipment storage shipment = shipments[_shipmentId];

        require(shipment.owner != address(0), "Shipment does not exist");
        require(!shipment.hasSigned[msg.sender], "Already approved");

        shipment.hasSigned[msg.sender] = true;
        shipment.approvals++;

        if (shipment.approvals == shipment.totalSigners) {
            require(shipment.stage != ShipmentStage.DELIVERED, "Shipment already delivered");
            shipment.stage = ShipmentStage(uint(shipment.stage) + 1);
            shipment.approvals = 0; // Reset approvals for next stage
            emit StageApproved(_shipmentId, shipment.stage, msg.sender);
        }
    }

    /**
     * @dev Get the current stage of a shipment.
     */
    function getShipmentStage(string memory _shipmentId) public view returns (ShipmentStage) {
        require(shipments[_shipmentId].owner != address(0), "Shipment does not exist");
        return shipments[_shipmentId].stage;
    }
}
