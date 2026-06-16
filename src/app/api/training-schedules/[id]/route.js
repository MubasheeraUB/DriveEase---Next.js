import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const schedule = await prisma.trainingSchedule.findUnique({
      where: { id },
      include: { student: true, driver: true, vehicle: true },
    });
    if (!schedule) return NextResponse.json({ message: "Training schedule not found" }, { status: 404 });
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.trainingSchedule.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Training schedule not found" }, { status: 404 });

    const body = await request.json();
    const { trainingDate, startTime, endTime, sessionType, status, remarks } = body;

    const updated = await prisma.trainingSchedule.update({
      where: { id },
      data: {
        studentId: body.studentId != null ? parseInt(body.studentId) : existing.studentId,
        driverId: body.driverId != null ? parseInt(body.driverId) : existing.driverId,
        vehicleId: body.vehicleId != null ? parseInt(body.vehicleId) : existing.vehicleId,
        trainingDate: trainingDate ? new Date(trainingDate) : existing.trainingDate,
        startTime: startTime ?? existing.startTime,
        endTime: endTime ?? existing.endTime,
        sessionType: sessionType ?? existing.sessionType,
        status: status ?? existing.status,
        remarks: remarks ?? existing.remarks,
      },
      include: { student: true, driver: true, vehicle: true },
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
    const existing = await prisma.trainingSchedule.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Training schedule not found" }, { status: 404 });

    await prisma.trainingSchedule.delete({ where: { id } });
    return NextResponse.json({ message: "Training schedule deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
