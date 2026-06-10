import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { joiningDate: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        coursePackage: true,
        joiningDate: true,
        gender: true,
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
