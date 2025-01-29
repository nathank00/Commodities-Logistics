import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function GET() {
  try {
    // Fetch deals from the database
    const result = await db.execute("SELECT id, name, createdAt FROM deals");

    console.log("Raw DB Response:", result);

    if (!result.rows) {
      return NextResponse.json({ error: "No deals found" }, { status: 404 });
    }

    // Ensure JSON-friendly response
    const deals = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    }));

    return NextResponse.json(deals);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
