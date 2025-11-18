import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const paiements = await prisma.paiement.findMany({
      include: {
        Demande: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(paiements);
  } catch (error) {
    console.error("Error fetching paiements:", error);
    return NextResponse.json(
      { error: "Failed to fetch paiements" },
      { status: 500 }
    );
  }
}
