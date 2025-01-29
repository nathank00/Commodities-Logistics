import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function GET(req: Request) {
  try {
    // Fetch all documents
    const result = await db.execute("SELECT id, stage_id, name, is_uploaded FROM documents");

    if (!result.rows.length) {
      return NextResponse.json({ error: "No documents found" }, { status: 404 });
    }

    const documents = result.rows.map((row: any) => ({
      id: row.id,
      stageId: row.stage_id,
      name: row.name,
      isUploaded: row.is_uploaded === 1, // Convert DB value to boolean
    }));

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
