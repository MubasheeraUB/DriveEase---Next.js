import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const payments = await prisma.payment.findMany({
      include: { student: true },
      orderBy: { paymentDate: "desc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { studentId, totalAmount, paidAmount, paymentDate, paymentMethod, remarks } =
      await request.json();

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

    const balanceAmount = totalAmount - paidAmount;
    const paymentStatus = balanceAmount <= 0 ? "paid" : "partial";

    const payment = await prisma.payment.create({
      data: {
        studentId, totalAmount, paidAmount, balanceAmount,
        paymentDate: new Date(paymentDate),
        paymentMethod, paymentStatus, remarks,
      },
      include: { student: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
