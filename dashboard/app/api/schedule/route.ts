import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage, day, startTime, endTime, artistName, note, description, imageUrl } = body;

    if (!stage || !day || !startTime || !endTime || !artistName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slot = await prisma.slot.create({
      data: { stage, day, startTime: new Date(startTime), endTime: new Date(endTime), artistName, note, description, imageUrl },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Error creating slot:", error);
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}
