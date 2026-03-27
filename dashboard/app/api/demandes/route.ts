import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const demandes = await prisma.demande.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(demandes);
  } catch (error) {
    console.error("Error fetching demandes:", error);
    return NextResponse.json(
      { error: "Failed to fetch demandes" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.demande.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting demande:", error);
    return NextResponse.json(
      { error: "Failed to delete demande" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, statut } = body;

    if (!id || !statut) {
      return NextResponse.json(
        { error: "Missing id or statut" },
        { status: 400 }
      );
    }

    const demande = await prisma.demande.update({
      where: { id },
      data: { statut },
    });

    return NextResponse.json(demande);
  } catch (error) {
    console.error("Error updating demande:", error);
    return NextResponse.json(
      { error: "Failed to update demande" },
      { status: 500 }
    );
  }
}
