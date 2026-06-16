import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/training-schedules?search=&status=&sessionType=&date=&page=&limit=
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sessionType = searchParams.get("sessionType") || "";
    const date = searchParams.get("date") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { student: { fullName: { contains: search, mode: "insensitive" } } },
        { driver: { fullName: { contains: search, mode: "insensitive" } } },
        { vehicle: { vehicleName: { contains: search, mode: "insensitive" } } },
        { vehicle: { vehicleNumber: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status) where.status = { equals: status, mode: "insensitive" };
    if (sessionType) where.sessionType = { contains: sessionType, mode: "insensitive" };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.trainingDate = { gte: start, lt: end };
    }

    const [schedules, total] = await Promise.all([
      prisma.trainingSchedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { trainingDate: "desc" },
        include: { student: true, driver: true, vehicle: true },
      }),
      prisma.trainingSchedule.count({ where }),
    ]);

    return NextResponse.json({
      schedules,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/training-schedules
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const studentId = parseInt(body.studentId);
    const driverId = parseInt(body.driverId);
    const vehicleId = parseInt(body.vehicleId);
    const { trainingDate, startTime, endTime, sessionType, status, remarks } = body;

    if (!studentId || !driverId || !vehicleId || !trainingDate || !startTime || !endTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const [student, driver, vehicle] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.driver.findUnique({ where: { id: driverId } }),
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);
    if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });
    if (!driver) return NextResponse.json({ message: "Driver not found" }, { status: 404 });
    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });

    // Prevent double-booking the same driver/vehicle at the same date & start time
    const clash = await prisma.trainingSchedule.findFirst({
      where: {
        trainingDate: new Date(trainingDate),
        startTime,
        OR: [{ driverId }, { vehicleId }],
        NOT: { status: "cancelled" },
      },
    });
    if (clash) {
      return NextResponse.json(
        { message: "Instructor or vehicle is already booked at this time" },
        { status: 409 }
      );
    }

    const schedule = await prisma.trainingSchedule.create({
      data: {
        studentId,
        driverId,
        vehicleId,
        trainingDate: new Date(trainingDate),
        startTime,
        endTime,
        sessionType: sessionType || "Practical",
        status: status || "scheduled",
        remarks: remarks || null,
      },
      include: { student: true, driver: true, vehicle: true },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
