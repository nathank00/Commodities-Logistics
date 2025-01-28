"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

type Stage = {
  id: number;
  name: string;
  documents: string[];
  signers: string[];
};

export default function NewDeal() {
  const [dealName, setDealName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [stageCounter, setStageCounter] = useState(1);
  const [newDocument, setNewDocument] = useState<{ [key: number]: string }>({});
  const [newSigner, setNewSigner] = useState<{ [key: number]: string }>({});

  const addStage = () => {
    setStages([...stages, { id: stageCounter, name: `Stage ${stageCounter}`, documents: [], signers: [] }]);
    setStageCounter(stageCounter + 1);
  };

  const updateStageName = (id: number, newName: string) => {
    setStages(stages.map(stage => (stage.id === id ? { ...stage, name: newName } : stage)));
  };

  const addDocument = (id: number) => {
    if (newDocument[id]?.trim()) {
      setStages(
        stages.map(stage =>
          stage.id === id ? { ...stage, documents: [...stage.documents, newDocument[id]] } : stage
        )
      );
      setNewDocument({ ...newDocument, [id]: "" });
    }
  };

  const addSigner = (id: number) => {
    if (newSigner[id]?.trim()) {
      setStages(
        stages.map(stage =>
          stage.id === id ? { ...stage, signers: [...stage.signers, newSigner[id]] } : stage
        )
      );
      setNewSigner({ ...newSigner, [id]: "" });
    }
  };

  const handleDeploy = () => {
    console.log("Deploying contract with stages:", { dealName, stages });
    toast.success("Contract deployment initiated!");
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-200 p-6 font-plexmono">
      {/* Home Button (Top Right Corner) */}
      <div className="w-full flex justify-between">
        <div></div> {/* Empty div to balance layout */}
        <Link href="/">
          <button className="text-neonGreen hover:text-lime-300 text-lg">Home</button>
        </Link>
      </div>

      {!isNameSet ? (
        <input
          type="text"
          placeholder="Enter Deal Name"
          className="mt-6 p-3 text-xl border border-neonGreen bg-gray-800 text-neonGreen rounded-md w-full max-w-md text-center"
          onChange={(e) => setDealName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && dealName.trim() !== "") {
              setIsNameSet(true);
            }
          }}
        />
      ) : (
        <div className="p-6 max-w-3xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-neonGreen text-center mb-6">{dealName}</h2>

          <button
            onClick={addStage}
            className="bg-neonGreen hover:bg-lime-400 text-gray-900 px-6 py-2 rounded-lg mb-6 w-full text-lg"
          >
            Add Stage
          </button>

          {/* Stages List */}
          <div className="space-y-6">
            {stages.map(stage => (
              <div key={stage.id} className="border border-neonGreen p-4 rounded-lg bg-gray-800 shadow-lg">
                <input
                  className="bg-gray-700 text-neonGreen border border-neonGreen px-2 py-1 w-full rounded-md"
                  value={stage.name}
                  onChange={(e) => updateStageName(stage.id, e.target.value)}
                />

                {/* Documents */}
                <div className="mt-3">
                  <strong className="text-neonGreen">Documents:</strong>
                  {stage.documents.length > 0 ? (
                    stage.documents.map((doc, index) => <p key={index} className="text-sm text-gray-300">{doc}</p>)
                  ) : (
                    <p className="text-gray-500 text-sm">No documents added</p>
                  )}
                  <div className="flex mt-2">
                    <input
                      type="text"
                      placeholder="Enter document name"
                      value={newDocument[stage.id] || ""}
                      onChange={(e) => setNewDocument({ ...newDocument, [stage.id]: e.target.value })}
                      className="bg-gray-700 text-neonGreen border border-neonGreen px-2 py-1 rounded-md flex-1"
                    />
                    <button
                      onClick={() => addDocument(stage.id)}
                      className="ml-2 bg-neonGreen hover:bg-lime-400 text-gray-900 px-3 py-1 rounded-md"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Signers (FIXED - Now Appears) */}
                <div className="mt-3">
                  <strong className="text-neonGreen">Signers:</strong>
                  {stage.signers.length > 0 ? (
                    stage.signers.map((signer, index) => <p key={index} className="text-sm text-gray-300">{signer}</p>)
                  ) : (
                    <p className="text-gray-500 text-sm">No signers added</p>
                  )}
                  <div className="flex mt-2">
                    <input
                      type="text"
                      placeholder="Enter signer wallet address"
                      value={newSigner[stage.id] || ""}
                      onChange={(e) => setNewSigner({ ...newSigner, [stage.id]: e.target.value })}
                      className="bg-gray-700 text-neonGreen border border-neonGreen px-2 py-1 rounded-md flex-1"
                    />
                    <button
                      onClick={() => addSigner(stage.id)}
                      className="ml-2 bg-neonGreen hover:bg-lime-400 text-gray-900 px-3 py-1 rounded-md"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Deploy Contract Button */}
          {stages.length > 0 && (
            <button
              onClick={handleDeploy}
              className="bg-neonGreen hover:bg-lime-500 text-gray-900 px-6 py-2 rounded-lg mt-6 w-full text-lg"
            >
              Deploy Contract
            </button>
          )}
        </div>
      )}
    </main>
  );
}
