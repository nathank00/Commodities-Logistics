import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      <h1 className="text-4xl font-bold text-neonGreen mb-8">Logistics Console</h1>
      <Link href="/new-deal">
        <button className="bg-neonGreen hover:bg-lime-400 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold">
          + New Deal
        </button>
      </Link>
    </main>
  );
}
