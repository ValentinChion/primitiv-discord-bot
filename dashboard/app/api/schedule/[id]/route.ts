import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { stage, day, startTime, endTime, artistName, note } = body;

    const slot = await prisma.slot.update({
      where: { id: params.id },
      data: {
        stage,
        day,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        artistName,
        note,
      },
    });
    return NextResponse.json(slot);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.slot.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
