import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { webpush } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json() as {
      title: string;
      body: string;
      url?: string;
    };

    if (!title || !body) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const subscriptions = await prisma.pushSubscription.findMany();

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title, body, url: url ?? "/schedule" }),
          );
          sent++;
        } catch (err: unknown) {
          failed++;
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    if (expiredEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: expiredEndpoints } },
      });
    }

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error("[notifications/send] POST error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
