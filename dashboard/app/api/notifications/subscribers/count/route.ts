import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.pushSubscription.count();
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[notifications/subscribers/count] GET error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
