import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function POST(req) {
  try {
    const { documentId, isUploaded } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    console.log("Updating document upload:", { documentId, isUploaded });

    await db.execute("UPDATE documents SET is_uploaded = ? WHERE id = ?", [isUploaded, documentId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to update document upload status" }, { status: 500 });
  }
}
