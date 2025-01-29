import { NextResponse } from "next/server";
import db from "@/lib/tursoClient";

export async function POST(req) {
  try {
    const { stageId, walletAddress, hasSigned } = await req.json();

    if (!stageId || !walletAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    console.log("Updating signer:", { stageId, walletAddress, hasSigned });

    await db.execute("UPDATE signers SET has_signed = ? WHERE stage_id = ? AND wallet_address = ?", [
      hasSigned,
      stageId,
      walletAddress,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to update signer" }, { status: 500 });
  }
}
