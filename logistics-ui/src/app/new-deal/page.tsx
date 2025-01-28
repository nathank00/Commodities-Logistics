"use client";

import { useState } from "react";
import Link from "next/link";
import StageManager from "../components/StageManager";

export default function NewDeal() {
  const [dealName, setDealName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-900 text-gray-200 p-6">
      {/* Home Button (Top Right) */}
      <div className="w-full flex justify-end">
        <Link href="/">
          <button className="text-neonGreen hover:text-lime-300">🏠 Home</button>
        </Link>
      </div>

      {/* Show Input Field Until Name is Set */}
      {!isNameSet ? (
        <input
          type="text"
          placeholder="Enter Deal Name"
          className="mt-24 p-3 text-xl border border-neonGreen bg-gray-800 text-neonGreen rounded-md w-full max-w-md text-center"
          onChange={(e) => setDealName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && dealName.trim() !== "") {
              setIsNameSet(true);
            }
          }}
        />
      ) : (
        // Show ONLY the Deal Name Once Set
        <h1 className="text-4xl font-bold text-neonGreen mt-24">{dealName}</h1>
      )}

      {/* Show StageManager Only After Deal Name is Set */}
      {isNameSet && <StageManager />}
    </main>
  );
}
