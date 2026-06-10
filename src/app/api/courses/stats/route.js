import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const [total, active, categoryGroups, statusGroups] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { status: "active" } }),
      prisma.course.groupBy({ by: ["category"], _count: { id: true }, _sum: { enrollments: true } }),
      prisma.course.groupBy({ by: ["status"], _count: { id: true } }),
    ]);

    const totalEnrollments = await prisma.course.aggregate({ _sum: { enrollments: true } });
    const avgFee = await prisma.course.aggregate({ _avg: { fee: true } });

    return NextResponse.json({
      total,
      active,
      totalEnrollments: totalEnrollments._sum.enrollments || 0,
      avgFee: Math.round(avgFee._avg.fee || 0),
      categoryDistribution: categoryGroups.map((g) => ({
        name: g.category,
        value: g._count.id,
        enrollments: g._sum.enrollments || 0,
      })),
      statusDistribution: statusGroups.map((g) => ({
        name: g.status,
        value: g._count.id,
      })),
      enrollmentDistribution: categoryGroups
        .map((g) => ({ name: g.category, value: g._sum.enrollments || 0 }))
        .filter((g) => g.value > 0),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
