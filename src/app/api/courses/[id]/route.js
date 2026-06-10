import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const course = await prisma.course.findUnique({
      where: { id },
      include: { driver: { select: { fullName: true } } },
    });
    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    const { name, code, category, driverId, duration, fee, status, description, imageUrl, enrollments } =
      await request.json();

    const updated = await prisma.course.update({
      where: { id },
      data: {
        name, code, category,
        driverId: driverId ? parseInt(driverId) : null,
        duration,
        fee: fee ? parseFloat(fee) : existing.fee,
        enrollments: enrollments ? parseInt(enrollments) : existing.enrollments,
        status, description, imageUrl,
      },
      include: { driver: { select: { fullName: true } } },
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
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
