import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalStudents = await prisma.student.count();
    const totalDrivers = await prisma.driver.count();
    const totalVehicles = await prisma.vehicle.count();

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const totalSchedules = await prisma.trainingSchedule.count({
      where: { trainingDate: { gte: startOfDay, lte: endOfDay } },
    });

    const revenue = await prisma.payment.aggregate({ _sum: { paidAmount: true } });
    const totalRevenue = revenue._sum.paidAmount || 0;

    return NextResponse.json({
      totalStudents, totalDrivers, totalVehicles, totalSchedules, totalRevenue,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
