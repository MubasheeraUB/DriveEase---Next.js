import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const [total, unread, starred, archived, categoryGroups] = await Promise.all([
      prisma.message.count({ where: { isArchived: false } }),
      prisma.message.count({ where: { isRead: false, isArchived: false } }),
      prisma.message.count({ where: { isStarred: true, isArchived: false } }),
      prisma.message.count({ where: { isArchived: true } }),
      prisma.message.groupBy({
        by: ["category"],
        where: { isArchived: false },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      total,
      unread,
      read: total - unread,
      starred,
      archived,
      categoryDistribution: categoryGroups.map((g) => ({
        name: g.category,
        value: g._count.id,
      })),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
