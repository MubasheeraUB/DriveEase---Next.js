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

    const body = await request.json();
    const totalAmount = body.totalAmount != null ? parseFloat(body.totalAmount) : existing.totalAmount;
    const paidAmount = body.paidAmount != null ? parseFloat(body.paidAmount) : existing.paidAmount;

    const balanceAmount = totalAmount - paidAmount;
    const paymentStatus = balanceAmount <= 0 ? "paid" : paidAmount <= 0 ? "pending" : "partial";

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : existing.paymentDate,
        paymentMethod: body.paymentMethod ?? existing.paymentMethod,
        paymentStatus,
        remarks: body.remarks ?? existing.remarks,
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
