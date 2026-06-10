import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);

    // ── Summary counts ───────────────────────────────────────────────────────
    const [
      totalStudents, activeStudents, newStudentsThisMonth,
      totalInstructors, activeInstructors,
      totalVehicles, activeVehicles,
      totalCourses, activeCourses,
      totalSchedules, completedSchedules,
      revenueAgg, revenueThisMonth,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: "active" } }),
      prisma.student.count({ where: { joiningDate: { gte: startOfMonth } } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: "active" } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "active" } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: "active" } }),
      prisma.trainingSchedule.count(),
      prisma.trainingSchedule.count({ where: { status: "completed" } }),
      prisma.payment.aggregate({ _sum: { paidAmount: true, totalAmount: true, balanceAmount: true } }),
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startOfMonth } },
        _sum: { paidAmount: true },
      }),
    ]);

    // ── Monthly enrollment trend (last 6 months) ─────────────────────────────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const students = await prisma.student.findMany({
      where: { joiningDate: { gte: sixMonthsAgo } },
      select: { joiningDate: true },
    });
    const enrollmentMap = {};
    students.forEach(s => {
      const key = new Date(s.joiningDate).toLocaleString("en-IN", { month: "short", year: "2-digit" });
      enrollmentMap[key] = (enrollmentMap[key] || 0) + 1;
    });
    const enrollmentTrend = Object.entries(enrollmentMap).map(([month, count]) => ({ month, count }));

    // ── Monthly revenue trend (last 6 months) ────────────────────────────────
    const payments = await prisma.payment.findMany({
      where: { paymentDate: { gte: sixMonthsAgo } },
      select: { paymentDate: true, paidAmount: true },
    });
    const revenueMap = {};
    payments.forEach(p => {
      const key = new Date(p.paymentDate).toLocaleString("en-IN", { month: "short", year: "2-digit" });
      revenueMap[key] = (revenueMap[key] || 0) + p.paidAmount;
    });
    const revenueTrend = Object.entries(revenueMap).map(([month, amount]) => ({ month, amount: Math.round(amount) }));

    // ── Student status breakdown ──────────────────────────────────────────────
    const allStudents = await prisma.student.findMany({ select: { status: true } });
    const studentStatusMap = {};
    allStudents.forEach(s => { studentStatusMap[s.status] = (studentStatusMap[s.status] || 0) + 1; });
    const studentStatusBreakdown = Object.entries(studentStatusMap).map(([name, value]) => ({ name, value }));

    // ── Course enrollment distribution ───────────────────────────────────────
    const allCourses = await prisma.course.findMany({
      select: { name: true, enrollments: true, category: true },
      orderBy: { enrollments: "desc" },
      take: 5,
    });

    // ── Payment method breakdown ──────────────────────────────────────────────
    const allPayments = await prisma.payment.findMany({ select: { paymentMethod: true, paidAmount: true } });
    const methodMap = {};
    allPayments.forEach(p => { methodMap[p.paymentMethod] = (methodMap[p.paymentMethod] || 0) + p.paidAmount; });
    const paymentMethodBreakdown = Object.entries(methodMap).map(([method, amount]) => ({ method, amount: Math.round(amount) }));

    // ── Schedule completion rate ──────────────────────────────────────────────
    const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalStudents, activeStudents, newStudentsThisMonth,
        totalInstructors, activeInstructors,
        totalVehicles, activeVehicles,
        totalCourses, activeCourses,
        totalSchedules, completedSchedules, completionRate,
        totalRevenue:        revenueAgg._sum.paidAmount    || 0,
        totalBilled:         revenueAgg._sum.totalAmount   || 0,
        pendingBalance:      revenueAgg._sum.balanceAmount || 0,
        revenueThisMonth:    revenueThisMonth._sum.paidAmount || 0,
      },
      enrollmentTrend,
      revenueTrend,
      studentStatusBreakdown,
      topCourses: allCourses,
      paymentMethodBreakdown,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
