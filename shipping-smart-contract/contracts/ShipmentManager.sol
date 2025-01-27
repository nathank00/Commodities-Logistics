// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ShipmentManager {
    // Define possible shipment stages
    enum ShipmentStage { CREATED, LOADED, IN_TRANSIT, DELIVERED }

    // Shipment details
    struct Shipment {
        string shipmentId;
        address owner;
        ShipmentStage stage;
    }

    // Mapping to track all shipments by their ID
    mapping(string => Shipment) public shipments;

    // Event to log shipment stage updates
    event ShipmentUpdated(string shipmentId, ShipmentStage newStage, address updatedBy);

    /**
     * @dev Create a new shipment
     */
    function createShipment(string memory _shipmentId) public {
        require(bytes(_shipmentId).length > 0, "Shipment ID required");
        require(shipments[_shipmentId].owner == address(0), "Shipment already exists");

        shipments[_shipmentId] = Shipment({
            shipmentId: _shipmentId,
            owner: msg.sender,
            stage: ShipmentStage.CREATED
        });

        emit ShipmentUpdated(_shipmentId, ShipmentStage.CREATED, msg.sender);
    }

    /**
     * @dev Move a shipment to the next stage
     */
    function advanceStage(string memory _shipmentId) public {
        require(shipments[_shipmentId].owner != address(0), "Shipment does not exist");
        Shipment storage shipment = shipments[_shipmentId];

        require(shipment.stage != ShipmentStage.DELIVERED, "Shipment already delivered");

        // Move to the next stage
        shipment.stage = ShipmentStage(uint(shipment.stage) + 1);

        emit ShipmentUpdated(_shipmentId, shipment.stage, msg.sender);
    }

    /**
     * @dev Get the current stage of a shipment
     */
    function getShipmentStage(string memory _shipmentId) public view returns (ShipmentStage) {
        require(shipments[_shipmentId].owner != address(0), "Shipment does not exist");
        return shipments[_shipmentId].stage;
    }
}
