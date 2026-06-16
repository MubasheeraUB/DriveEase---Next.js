import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals, monthAgg, statusGroups, methodGroups, paidCount] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { totalAmount: true, paidAmount: true, balanceAmount: true },
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startOfMonth } },
        _sum: { paidAmount: true },
      }),
      prisma.payment.groupBy({ by: ["paymentStatus"], _count: { id: true } }),
      prisma.payment.groupBy({ by: ["paymentMethod"], _sum: { paidAmount: true }, _count: { id: true } }),
      prisma.payment.count({ where: { paymentStatus: "paid" } }),
    ]);

    const totalCollected = totals._sum.paidAmount || 0;
    const totalBilled = totals._sum.totalAmount || 0;
    const pendingBalance = totals._sum.balanceAmount || 0;
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    return NextResponse.json({
      totalCollected,
      totalBilled,
      pendingBalance,
      collectedThisMonth: monthAgg._sum.paidAmount || 0,
      transactions: totals._count.id,
      fullyPaid: paidCount,
      collectionRate,
      statusDistribution: statusGroups.map((g) => ({ name: g.paymentStatus, value: g._count.id })),
      methodDistribution: methodGroups.map((g) => ({
        name: g.paymentMethod,
        value: Math.round(g._sum.paidAmount || 0),
        count: g._count.id,
      })),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
