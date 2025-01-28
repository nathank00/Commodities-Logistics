import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM deals");

    console.log("Database Fetch Result:", result.rows); // ✅ Debugging Step

    return NextResponse.json(result.rows); // ✅ Always return JSON
  } catch (error) {
    console.error("Error fetching deals:", error);
    
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
