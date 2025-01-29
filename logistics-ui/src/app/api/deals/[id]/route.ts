import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function GET(req, context) {
  try {
    const dealId = context.params.id; // Fix params usage
    if (!dealId) {
      return NextResponse.json({ error: "Missing deal ID" }, { status: 400 });
    }

    console.log("Fetching deal with ID:", dealId);

    // Fetch deal details
    const dealResult = await db.execute("SELECT id, name, createdAt FROM deals WHERE id = ?", [dealId]);

    if (!dealResult.rows.length) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const deal = dealResult.rows[0];

    // Fetch related stages
    const stagesResult = await db.execute("SELECT id, name, status FROM stages WHERE deal_id = ?", [dealId]);

    const stages = await Promise.all(
      stagesResult.rows.map(async (stage) => {
        // Fetch documents for the stage
        const documentsResult = await db.execute("SELECT id, name, is_uploaded FROM documents WHERE stage_id = ?", [
          stage.id,
        ]);

        // Fetch signers for the stage
        const signersResult = await db.execute("SELECT id, wallet_address, has_signed FROM signers WHERE stage_id = ?", [
          stage.id,
        ]);

        return {
          ...stage,
          documents: documentsResult.rows,
          signers: signersResult.rows,
        };
      })
    );

    return NextResponse.json({ ...deal, stages });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 });
  }
}
