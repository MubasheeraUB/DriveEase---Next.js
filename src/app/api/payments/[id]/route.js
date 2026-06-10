import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const payment = await prisma.payment.findUnique({ where: { id }, include: { student: true } });
    if (!payment) return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Payment not found" }, { status: 404 });

    const { totalAmount, paidAmount, paymentDate, paymentMethod, remarks } = await request.json();

    const balanceAmount = totalAmount - paidAmount;
    const paymentStatus = balanceAmount <= 0 ? "paid" : "partial";

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        totalAmount, paidAmount, balanceAmount,
        paymentDate: new Date(paymentDate),
        paymentMethod, paymentStatus, remarks,
      },
      include: { student: true },
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
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Payment not found" }, { status: 404 });

    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
