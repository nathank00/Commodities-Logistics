"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, FileText, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function DealPage() {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${id}`);
        const data = await response.json();
        setDeal(data);
      } catch (error) {
        console.error("Error fetching deal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  const handleToggleSign = async (stageId, walletAddress, hasSigned) => {
    try {
      console.log("Toggling signature:", { stageId, walletAddress, hasSigned });

      const response = await fetch("/api/signers/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, walletAddress, hasSigned }),
      });

      if (!response.ok) throw new Error("Failed to update signature status");

      setDeal((prevDeal) => ({
        ...prevDeal,
        stages: prevDeal.stages.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                signers: stage.signers.map((signer) =>
                  signer.walletAddress === walletAddress ? { ...signer, hasSigned } : signer
                ),
              }
            : stage
        ),
      }));
    } catch (error) {
      console.error("Error updating signature status:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (!deal) return <p className="text-center text-red-500">Deal not found</p>;

  return (
    <div className="min-h-screen bg-[#0d1117] font-mono">
      <main className="container px-4 py-6">
        <Card className="mb-8 bg-[#0d1117] border-[#30363d]">
          <CardHeader>
            <CardTitle className="text-[#39ff14]">Deal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={100} className="w-full" />
          </CardContent>
        </Card>

        {deal.stages.map((stage) => (
          <Card key={stage.id} className="bg-[#0d1117] border-[#30363d]">
            <CardHeader>
              <CardTitle className="text-[#39ff14]">{stage.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium text-[#c9d1d9]">Required Documents</h3>
                {stage.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border border-[#30363d] p-3">
                    <p className="text-sm text-[#c9d1d9]">{doc.name}</p>
                    <Button onClick={() => handleUploadDocument(doc.id, !doc.isUploaded)}>
                      {doc.isUploaded ? "Uploaded" : "Upload"}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Signers */}
              <div>
                <h3 className="text-sm font-medium text-[#c9d1d9]">Signers</h3>
                {stage.signers.map((signer) => (
                  <div key={signer.walletAddress} className="flex items-center justify-between border p-3">
                    <p className="text-sm text-[#c9d1d9]">{signer.walletAddress}</p>
                    <Button onClick={() => handleToggleSign(stage.id, signer.walletAddress, !signer.hasSigned)}>
                      {signer.hasSigned ? "Signed" : "Sign"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
