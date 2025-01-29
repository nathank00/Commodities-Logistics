"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Deal = {
  id: string;
  name: string;
  createdAt: string;
};

export default function AllDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevents unnecessary re-renders

    async function fetchDeals() {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) throw new Error("Failed to fetch deals");

        const data = await response.json();
        console.log("Fetched Deals:", data); // ✅ Debugging log

        if (isMounted) {
          setDeals(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching deals:", error);
        if (isMounted) setLoading(false);
      }
    }

    fetchDeals();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []); // ✅ Runs only once

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">All Deals</h2>

      {loading ? (
        <p className="text-gray-400 text-center">Loading deals...</p>
      ) : deals.length === 0 ? (
        <p className="text-gray-500 text-center">No deals found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Link key={deal.id} href={`/deal/${deal.id}`}>
              <div className="bg-gray-800 border border-neonGreen p-4 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition">
                <h3 className="text-xl font-semibold text-neonGreen">{deal.name}</h3>
                <p className="text-gray-400 text-sm mt-2">Created: {new Date(deal.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
