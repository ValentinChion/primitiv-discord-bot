import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pins = await prisma.mapPin.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(pins);
  } catch {
    return NextResponse.json({ error: "Failed to fetch pins" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pin = await prisma.mapPin.create({
      data: {
        label: body.label,
        category: body.category,
        lat: parseFloat(body.lat),
        lon: parseFloat(body.lon),
        description: body.description || null,
      },
    });
    return NextResponse.json(pin, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create pin" }, { status: 500 });
  }
}
