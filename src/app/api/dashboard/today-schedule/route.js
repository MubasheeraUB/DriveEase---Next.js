import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const schedules = await prisma.trainingSchedule.findMany({
      where: { trainingDate: { gte: start, lte: end } },
      orderBy: { startTime: "asc" },
      include: {
        student: { select: { fullName: true } },
        driver: { select: { fullName: true } },
        vehicle: { select: { vehicleName: true, vehicleNumber: true } },
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
