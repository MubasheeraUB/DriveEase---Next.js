import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/students/:id
export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/students/:id
export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Student not found" }, { status: 404 });

    const {
      fullName, email, phone, dateOfBirth, gender, address,
      guardianName, guardianPhone, licenseType, learningLicenseNo,
      coursePackage, status,
    } = await request.json();

    const updated = await prisma.student.update({
      where: { id },
      data: {
        fullName, email, phone,
        dateOfBirth: new Date(dateOfBirth),
        gender, address, guardianName, guardianPhone,
        licenseType, learningLicenseNo, coursePackage, status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/students/:id
export async function DELETE(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Student not found" }, { status: 404 });

    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
