"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Deal = {
  id: string;
  name: string;
};

export default function AllDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/getDeals");
        const data = await res.json();
        setDeals(data);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      }
    };

    fetchDeals();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-200 p-6 font-plexmono">
      {/* Home Button (Top Right Corner) */}
      <div className="w-full flex justify-between">
        <div></div> {/* Empty div to balance layout */}
        <Link href="/">
          <button className="text-neonGreen hover:text-lime-300 text-lg">Home</button>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-neonGreen text-center mb-6">All Deals</h2>

      {deals.length === 0 ? (
        <p className="text-gray-500 text-lg">No deals found.</p>
      ) : (
        <div className="w-full max-w-2xl space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="border border-neonGreen p-4 rounded-lg bg-gray-800 shadow-lg">
              <h3 className="text-xl font-bold text-neonGreen">{deal.name}</h3>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
