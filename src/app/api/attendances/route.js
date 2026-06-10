import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

const includeSchedule = {
  trainingSchedule: { include: { student: true, driver: true, vehicle: true } },
};

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const attendances = await prisma.attendance.findMany({
      include: includeSchedule,
      orderBy: { attendanceDate: "desc" },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { trainingScheduleId, attendanceDate, status, remarks } = await request.json();

    const schedule = await prisma.trainingSchedule.findUnique({
      where: { id: trainingScheduleId },
    });
    if (!schedule) {
      return NextResponse.json({ message: "Training schedule not found" }, { status: 404 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        trainingScheduleId,
        attendanceDate: new Date(attendanceDate),
        status,
        remarks,
      },
      include: includeSchedule,
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
