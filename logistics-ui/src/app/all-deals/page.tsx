import Link from "next/link";
import AllDeals from "@/components/AllDeals";

export default function AllDealsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-900 text-gray-200 p-6">
      <div className="w-full flex justify-end">
        {/* Home Button */}
        <Link href="/">
          <button className="text-neonGreen hover:text-lime-300">Home</button>
        </Link>
      </div>

      {/* Show Deals Dashboard */}
      <AllDeals />
    </main>
  );
}
