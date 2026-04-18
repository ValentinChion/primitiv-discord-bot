import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    const result = await prisma.participant.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("Error deleting participants:", error);
    return NextResponse.json({ error: "Failed to delete participants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone } = body;

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const participant = await prisma.participant.create({
      data: { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() },
    });
    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json({ error: "Failed to create participant" }, { status: 500 });
  }
}
