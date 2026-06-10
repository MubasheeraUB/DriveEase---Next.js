import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const [total, active, learnerPending, testReady, courseGroups, genderGroups] =
      await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { status: "active" } }),
        prisma.student.count({ where: { learningLicenseNo: null } }),
        prisma.student.count({ where: { status: "completed" } }),
        prisma.student.groupBy({ by: ["coursePackage"], _count: { id: true } }),
        prisma.student.groupBy({ by: ["gender"], _count: { id: true } }),
      ]);

    return NextResponse.json({
      total,
      active,
      learnerPending,
      testReady,
      courseDistribution: courseGroups.map((g) => ({
        name: g.coursePackage,
        value: g._count.id,
      })),
      genderDistribution: genderGroups.map((g) => ({
        name: g.gender,
        value: g._count.id,
      })),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
