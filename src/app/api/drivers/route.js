import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/drivers
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const specialization = searchParams.get("specialization") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = { equals: status, mode: "insensitive" };
    if (specialization) where.vehicleType = { contains: specialization, mode: "insensitive" };

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { trainingSchedules: true } } },
      }),
      prisma.driver.count({ where }),
    ]);

    const result = drivers.map((d) => {
      const { _count, ...rest } = d;
      return { ...rest, totalLessons: _count.trainingSchedules };
    });

    return NextResponse.json({
      instructors: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/drivers
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const {
      fullName, email, phone, licenseNumber, licenseExpiry,
      vehicleType, experienceYears, address, joiningDate,
    } = await request.json();

    const existingDriver = await prisma.driver.findFirst({
      where: { OR: [{ email }, { licenseNumber }] },
    });

    if (existingDriver) {
      return NextResponse.json({ message: "Driver already exists" }, { status: 400 });
    }

    const driver = await prisma.driver.create({
      data: {
        fullName, email, phone, licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        vehicleType, experienceYears, address,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
