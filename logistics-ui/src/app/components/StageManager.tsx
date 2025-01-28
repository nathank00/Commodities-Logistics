"use client";

import { useState } from "react";
import { toast } from "react-toastify";

type Stage = {
  id: number;
  name: string;
  documents: string[];
  signers: string[];
};

export default function StageManager() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [stageCounter, setStageCounter] = useState(1);

  const addStage = () => {
    setStages([
      ...stages,
      { id: stageCounter, name: `Stage ${stageCounter}`, documents: [], signers: [] }
    ]);
    setStageCounter(stageCounter + 1);
  };

  const updateStageName = (id: number, newName: string) => {
    setStages(stages.map(stage => stage.id === id ? { ...stage, name: newName } : stage));
  };

  const addDocument = (id: number) => {
    const docName = prompt("Enter document name:");
    if (docName) {
      setStages(stages.map(stage => stage.id === id ? { ...stage, documents: [...stage.documents, docName] } : stage));
    }
  };

  const addSigner = (id: number) => {
    const signer = prompt("Enter signer wallet address:");
    if (signer) {
      setStages(stages.map(stage => stage.id === id ? { ...stage, signers: [...stage.signers, signer] } : stage));
    }
  };

  const deleteStage = (id: number) => {
    setStages(stages.filter(stage => stage.id !== id));
    toast.info("Stage removed successfully!");
  };

  const handleDeploy = () => {
    console.log("Deploying contract with stages:", stages);
    toast.success("Contract deployment initiated!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center"></h2>
      
      <button
        onClick={addStage}
        className="bg-neonGreen hover:bg-lime-400 text-gray-900 px-6 py-2 rounded-lg mb-6 w-full text-lg"
      >
        + Add Stage
      </button>

      <div className="space-y-6">
        {stages.map(stage => (
          <div key={stage.id} className="border border-neonGreen p-4 rounded-lg bg-gray-800 shadow-lg">
            <input
              className="bg-gray-700 text-neonGreen border border-neonGreen px-2 py-1 w-full rounded-md"
              value={stage.name}
              onChange={(e) => updateStageName(stage.id, e.target.value)}
            />
            <div className="mt-3">
              <strong className="text-neonGreen">Documents:</strong>
              {stage.documents.length > 0 ? (
                stage.documents.map((doc, index) => (
                  <p key={index} className="text-sm text-gray-300">{doc}</p>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No documents added</p>
              )}
              <button onClick={() => addDocument(stage.id)} className="text-neonGreen text-sm hover:text-lime-300 mt-2">+ Add Document</button>
            </div>
            <div className="mt-3">
              <strong className="text-neonGreen">Signers:</strong>
              {stage.signers.length > 0 ? (
                stage.signers.map((signer, index) => (
                  <p key={index} className="text-sm text-gray-300">{signer}</p>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No signers added</p>
              )}
              <button onClick={() => addSigner(stage.id)} className="text-neonGreen text-sm hover:text-lime-300 mt-2">+ Add Signer</button>
            </div>
            <button 
              onClick={() => deleteStage(stage.id)} 
              className="text-red-400 hover:text-red-300 text-sm mt-3"
            >
              Delete Stage
            </button>
          </div>
        ))}
      </div>

      {stages.length > 0 && (
        <button
          onClick={handleDeploy}
          className="bg-neonGreen hover:bg-lime-500 text-gray-900 px-6 py-2 rounded-lg mt-6 w-full text-lg"
        >
          🚀 Deploy Contract
        </button>
      )}
    </div>
  );
}
