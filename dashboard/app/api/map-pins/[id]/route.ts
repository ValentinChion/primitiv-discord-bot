import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const pin = await prisma.mapPin.update({
      where: { id },
      data: {
        label: body.label,
        category: body.category,
        lat: parseFloat(body.lat),
        lon: parseFloat(body.lon),
        description: body.description || null,
      },
    });
    return NextResponse.json(pin);
  } catch {
    return NextResponse.json({ error: "Failed to update pin" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.mapPin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete pin" }, { status: 500 });
  }
}
