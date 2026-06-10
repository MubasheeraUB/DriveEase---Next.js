import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/students?search=&course=&status=&page=&limit=
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const course = searchParams.get("course") || "";
    const status = searchParams.get("status") || "";
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
    if (course) where.coursePackage = { contains: course, mode: "insensitive" };
    if (status) where.status = status;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          trainingSchedules: {
            include: { driver: { select: { fullName: true } } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: { select: { trainingSchedules: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);

    const studentsWithProgress = await Promise.all(
      students.map(async (s) => {
        const completedCount = await prisma.trainingSchedule.count({
          where: { studentId: s.id, status: "completed" },
        });
        const totalCount = s._count.trainingSchedules;
        const progress =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const instructor = s.trainingSchedules[0]?.driver?.fullName || null;
        const { trainingSchedules, _count, ...rest } = s;
        return { ...rest, progress, instructor };
      })
    );

    return NextResponse.json({
      students: studentsWithProgress,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/students
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const {
      fullName, email, phone, dateOfBirth, gender, address,
      guardianName, guardianPhone, licenseType, learningLicenseNo, coursePackage,
    } = await request.json();

    if (email) {
      const existingStudent = await prisma.student.findUnique({ where: { email } });
      if (existingStudent) {
        return NextResponse.json({ message: "Student already exists" }, { status: 400 });
      }
    }

    const student = await prisma.student.create({
      data: {
        fullName, email, phone,
        dateOfBirth: new Date(dateOfBirth),
        gender, address, guardianName, guardianPhone,
        licenseType, learningLicenseNo, coursePackage,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
