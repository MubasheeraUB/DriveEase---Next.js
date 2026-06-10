import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [total, active, onLeave, inactive, lessonsThisMonth, vehicleGroups, statusGroups] =
      await Promise.all([
        prisma.driver.count(),
        prisma.driver.count({ where: { status: "active" } }),
        prisma.driver.count({ where: { status: "on leave" } }),
        prisma.driver.count({ where: { status: "inactive" } }),
        prisma.trainingSchedule.count({
          where: { trainingDate: { gte: startOfMonth, lte: endOfMonth } },
        }),
        prisma.driver.groupBy({ by: ["vehicleType"], _count: { id: true } }),
        prisma.driver.groupBy({ by: ["status"], _count: { id: true } }),
      ]);

    return NextResponse.json({
      total,
      active,
      onLeave,
      inactive,
      lessonsThisMonth,
      vehicleDistribution: vehicleGroups.map((g) => ({ name: g.vehicleType, value: g._count.id })),
      statusDistribution: statusGroups.map((g) => ({ name: g.status, value: g._count.id })),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
