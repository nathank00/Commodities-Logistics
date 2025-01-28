import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function POST(req: Request) {
  try {
    const { dealName, stages } = await req.json();
    const dealId = crypto.randomUUID();

    // Insert deal
    await db.execute({
      sql: "INSERT INTO deals (id, name) VALUES (?, ?)",
      args: [dealId, dealName],
    });

    for (const stage of stages) {
      const { name, documents, signers } = stage;

      // Insert stage
      const stageResult = await db.execute({
        sql: "INSERT INTO stages (deal_id, name) VALUES (?, ?) RETURNING id",
        args: [dealId, name],
      });

      const stageId = stageResult.rows[0].id;

      // Insert documents
      for (const doc of documents) {
        await db.execute({
          sql: "INSERT INTO documents (stage_id, name) VALUES (?, ?)",
          args: [stageId, doc],
        });
      }

      // Insert signers
      for (const signer of signers) {
        await db.execute({
          sql: "INSERT INTO signers (stage_id, address) VALUES (?, ?)",
          args: [stageId, signer],
        });
      }
    }

    return NextResponse.json({ message: "Deal saved successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error saving deal:", error);
    return NextResponse.json({ error: "Failed to save deal" }, { status: 500 });
  }
}
