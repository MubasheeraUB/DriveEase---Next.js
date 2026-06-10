import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

const includeSchedule = {
  trainingSchedule: { include: { student: true, driver: true, vehicle: true } },
};

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const attendance = await prisma.attendance.findUnique({ where: { id }, include: includeSchedule });
    if (!attendance) return NextResponse.json({ message: "Attendance not found" }, { status: 404 });
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Attendance not found" }, { status: 404 });

    const { attendanceDate, status, remarks } = await request.json();

    const updated = await prisma.attendance.update({
      where: { id },
      data: { attendanceDate: new Date(attendanceDate), status, remarks },
      include: includeSchedule,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Attendance not found" }, { status: 404 });

    await prisma.attendance.delete({ where: { id } });
    return NextResponse.json({ message: "Attendance deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
