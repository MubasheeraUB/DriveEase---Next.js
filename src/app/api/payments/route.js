import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/payments?search=&status=&method=&page=&limit=
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const method = searchParams.get("method") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { student: { fullName: { contains: search, mode: "insensitive" } } },
        { student: { phone: { contains: search, mode: "insensitive" } } },
        { invoiceNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.paymentStatus = { equals: status, mode: "insensitive" };
    if (method) where.paymentMethod = { contains: method, mode: "insensitive" };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: "desc" },
        include: { student: true },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/payments
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const studentId = parseInt(body.studentId);
    const totalAmount = parseFloat(body.totalAmount);
    const paidAmount = parseFloat(body.paidAmount);
    const { paymentDate, paymentMethod, remarks } = body;

    if (!studentId || isNaN(totalAmount) || isNaN(paidAmount) || !paymentDate || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

    const balanceAmount = totalAmount - paidAmount;
    const paymentStatus = balanceAmount <= 0 ? "paid" : paidAmount <= 0 ? "pending" : "partial";

    // Generate a sequential invoice number based on the latest id (collision-safe across deletes)
    const setting = await prisma.systemSetting.findFirst();
    const prefix = setting?.invoicePrefix || "INV";
    const last = await prisma.payment.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
    const invoiceNumber = `${prefix}-${String((last?.id || 0) + 1).padStart(5, "0")}`;

    const payment = await prisma.payment.create({
      data: {
        studentId,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        paymentStatus,
        invoiceNumber,
        remarks: remarks || null,
      },
      include: { student: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
