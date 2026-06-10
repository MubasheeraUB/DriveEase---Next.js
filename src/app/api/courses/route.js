import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { contains: category, mode: "insensitive" };
    if (status) where.status = { equals: status, mode: "insensitive" };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: { driver: { select: { id: true, fullName: true } } },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      courses, total, page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { name, code, category, driverId, duration, fee, status, description, imageUrl } =
      await request.json();

    const existing = await prisma.course.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ message: "Course code already exists" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        name, code, category,
        driverId: driverId ? parseInt(driverId) : null,
        duration,
        fee: parseFloat(fee),
        status: status || "active",
        description,
        imageUrl,
      },
      include: { driver: { select: { fullName: true } } },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
