import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Connect to Turso DB
const db = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
});

export async function POST(req: Request) {
  try {
    console.log("📩 Received request to store deal");
    const body = await req.text();
    console.log("📜 Raw Request Body:", body);

    const parsedBody = JSON.parse(body);
    console.log("✅ Parsed Request Body:", parsedBody);

    const { dealName, stages } = parsedBody;

    if (!dealName || !stages || stages.length === 0) {
      console.error("🚨 Invalid data detected:", { dealName, stages });
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    console.log(`🔹 Storing Deal: ${dealName}`);

    // Insert the deal
    const dealId = crypto.randomUUID();
    console.log(`📝 Inserting Deal: ID=${dealId}, Name=${dealName}`);
    await db.execute({
      sql: `INSERT INTO deals (id, name) VALUES (?, ?)`,
      args: [dealId, dealName],
    });

    for (const stage of stages) {
      const stageId = crypto.randomUUID();
      console.log(`📝 Inserting Stage: ID=${stageId}, Name=${stage.name}`);
      await db.execute({
        sql: `INSERT INTO stages (id, deal_id, name) VALUES (?, ?, ?)`,
        args: [stageId, dealId, stage.name],
      });

      for (const doc of stage.documents) {
        console.log(`📄 Inserting Document: Name=${doc}, StageID=${stageId}`);
        await db.execute({
          sql: `INSERT INTO documents (stage_id, name) VALUES (?, ?)`,
          args: [stageId, doc],
        });
      }

      for (const signer of stage.signers) {
        console.log(`✍️ Inserting Signer: Address=${signer}, StageID=${stageId}`);
        await db.execute({
          sql: `INSERT INTO signers (stage_id, wallet_address) VALUES (?, ?)`,
          args: [stageId, signer],
        });
      }
    }

    console.log("✅ Deal successfully stored!");
    return NextResponse.json({ success: true, message: "Deal stored successfully" });
  } catch (error) {
    console.error("❌ Database Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.toString() }, { status: 500 });
  }
}
