import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, unread, today, typeGroups, categoryGroups] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.notification.groupBy({ by: ["type"], _count: { id: true } }),
      prisma.notification.groupBy({ by: ["category"], _count: { id: true } }),
    ]);

    return NextResponse.json({
      total,
      unread,
      read: total - unread,
      today,
      typeDistribution: typeGroups.map((g) => ({ name: g.type, value: g._count.id })),
      categoryDistribution: categoryGroups.map((g) => ({ name: g.category, value: g._count.id })),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
