import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
      where: { paymentDate: { gte: start, lte: end } },
      select: { paidAmount: true, paymentMethod: true },
    });

    const total = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    const breakdown = payments.reduce((acc, p) => {
      const key = p.paymentMethod || "Other";
      acc[key] = (acc[key] || 0) + p.paidAmount;
      return acc;
    }, {});

    const breakdownArr = Object.entries(breakdown).map(([method, amount]) => ({
      method,
      amount,
    }));

    return NextResponse.json({ total, breakdown: breakdownArr });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
