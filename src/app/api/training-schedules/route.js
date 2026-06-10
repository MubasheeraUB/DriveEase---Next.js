import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const schedules = await prisma.trainingSchedule.findMany({
      include: { student: true, driver: true, vehicle: true },
      orderBy: { trainingDate: "desc" },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { studentId, driverId, vehicleId, trainingDate, startTime, endTime, sessionType, remarks } =
      await request.json();

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) return NextResponse.json({ message: "Driver not found" }, { status: 404 });

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });

    const schedule = await prisma.trainingSchedule.create({
      data: {
        studentId, driverId, vehicleId,
        trainingDate: new Date(trainingDate),
        startTime, endTime, sessionType, remarks,
      },
      include: { student: true, driver: true, vehicle: true },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
