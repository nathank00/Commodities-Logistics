// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Shipment {
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    bytes32 public constant INFO_PROVIDER_ROLE = keccak256("INFO_PROVIDER_ROLE");

    struct Stage {
        string name;  
        string[] requiredDocuments;  
        address[] signers;  
        address[] infoProviders;  
        mapping(address => bool) hasSigned;  
        uint256 approvals;  
        string[] uploadedDocuments; 
        bool allDocsUploaded;  
    }

    string public shipmentId;
    address public owner;
    uint256 public currentStage;  
    mapping(uint256 => Stage) public stages;  
    uint256 public totalStages;
    bool public isFinalized;

    event ShipmentCreated(string shipmentId, address owner);
    event DocumentUploaded(string shipmentId, uint256 stageIndex, address uploadedBy, string documentName);
    event StageApproved(string shipmentId, uint256 stageIndex, address approvedBy);
    event ShipmentFinalized(string shipmentId);

    constructor(
        string memory _shipmentId,
        string[] memory stageNames,
        string[][] memory stageDocs,
        address[][] memory stageSigners,
        address[][] memory stageInfoProviders
    ) {
        require(stageNames.length > 0, "Must have at least one stage");

        shipmentId = _shipmentId;
        owner = msg.sender;
        currentStage = 0;
        totalStages = stageNames.length;
        isFinalized = false;

        for (uint256 i = 0; i < stageNames.length; i++) {
            stages[i].name = stageNames[i];
            stages[i].requiredDocuments = stageDocs[i];
            stages[i].signers = stageSigners[i];
            stages[i].infoProviders = stageInfoProviders[i];
            stages[i].allDocsUploaded = false;  
        }

        emit ShipmentCreated(_shipmentId, msg.sender);
    }

    event DebugInfoProvider(address caller, address[] assignedProviders);

    function uploadDocument(uint256 stageIndex, string memory documentName) public {
        require(!isFinalized, "Shipment is finalized");
        require(stageIndex < totalStages, "Invalid stage index");

        emit DebugInfoProvider(msg.sender, stages[stageIndex].infoProviders); // ✅ Log caller and assigned providers

        bool isAuthorized = false;
        for (uint256 i = 0; i < stages[stageIndex].infoProviders.length; i++) {
            if (address(stages[stageIndex].infoProviders[i]) == address(msg.sender)) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "Not assigned as an info provider");

        require(isAuthorized, "Not assigned as an info provider"); // 🚨 ERROR THROWN HERE

        for (uint256 i = 0; i < stages[stageIndex].uploadedDocuments.length; i++) {
            require(
                keccak256(abi.encodePacked(stages[stageIndex].uploadedDocuments[i])) != keccak256(abi.encodePacked(documentName)),
                "Document already uploaded"
            );
        }

        stages[stageIndex].uploadedDocuments.push(documentName);
        emit DocumentUploaded(shipmentId, stageIndex, msg.sender, documentName);
    }



    function approveStage(uint256 stageIndex) public {
        require(!isFinalized, "Shipment is finalized");
        require(stageIndex == currentStage, "Can only approve the current stage");
        require(stages[stageIndex].allDocsUploaded, "All required documents must be uploaded before approval");
        
        bool isSigner = false;
        for (uint256 i = 0; i < stages[stageIndex].signers.length; i++) {
            if (stages[stageIndex].signers[i] == msg.sender) {
                isSigner = true;
                break;
            }
        }
        require(isSigner, "Not assigned as a signer");

        require(!stages[stageIndex].hasSigned[msg.sender], "Already approved this stage");
        stages[stageIndex].hasSigned[msg.sender] = true;
        stages[stageIndex].approvals++;

        emit StageApproved(shipmentId, stageIndex, msg.sender);

        if (stages[stageIndex].approvals == stages[stageIndex].signers.length) {
            if (stageIndex == totalStages - 1) {
                isFinalized = true;
                emit ShipmentFinalized(shipmentId);
            } else {
                currentStage++;
            }
        }
    }

    function getCurrentStage() public view returns (uint256) {
        return currentStage;
    }

    function getCurrentStageName() public view returns (string memory) {
        return stages[currentStage].name;
    }

    function getUploadedDocuments(uint256 stageIndex) public view returns (string[] memory) {
        require(stageIndex < totalStages, "Invalid stage index");
        return stages[stageIndex].uploadedDocuments;
    }

    function getStageInfoProviders(uint256 stageIndex) public view returns (address[] memory) {
        return stages[stageIndex].infoProviders;
}

}
