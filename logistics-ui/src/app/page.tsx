"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-6 font-plexmono">
      <h1 className="text-4xl font-bold text-neonGreen mb-6">Logistics Console</h1>

      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <Link href="/new-deal">
          <button className="bg-neonGreen hover:bg-lime-400 text-gray-900 px-6 py-3 rounded-lg w-full text-lg">
            New Deal
          </button>
        </Link>
        <Link href="/all-deals">
          <button className="bg-black border-2 border-neonGreen text-neonGreen hover:bg-gray-800 px-6 py-3 rounded-lg w-full text-lg">
            All Deals
          </button>
        </Link>
      </div>
    </main>
  );
}
