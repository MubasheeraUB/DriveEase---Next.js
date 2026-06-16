import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay());

    const [total, scheduled, completed, cancelled, todayCount, weekCount, statusGroups, typeGroups] =
      await Promise.all([
        prisma.trainingSchedule.count(),
        prisma.trainingSchedule.count({ where: { status: "scheduled" } }),
        prisma.trainingSchedule.count({ where: { status: "completed" } }),
        prisma.trainingSchedule.count({ where: { status: "cancelled" } }),
        prisma.trainingSchedule.count({ where: { trainingDate: { gte: startOfDay, lt: endOfDay } } }),
        prisma.trainingSchedule.count({ where: { trainingDate: { gte: startOfWeek } } }),
        prisma.trainingSchedule.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.trainingSchedule.groupBy({ by: ["sessionType"], _count: { id: true } }),
      ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      total,
      scheduled,
      completed,
      cancelled,
      today: todayCount,
      thisWeek: weekCount,
      completionRate,
      statusDistribution: statusGroups.map((g) => ({ name: g.status, value: g._count.id })),
      typeDistribution: typeGroups.map((g) => ({ name: g.sessionType, value: g._count.id })),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
