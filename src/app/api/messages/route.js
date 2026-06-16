import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/messages?search=&category=&status=&starred=&page=&limit=
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || ""; // read | unread | archived
    const starred = searchParams.get("starred"); // "true"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { senderName: { contains: search, mode: "insensitive" } },
        { senderEmail: { contains: search, mode: "insensitive" } },
        { senderPhone: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { equals: category, mode: "insensitive" };
    if (status === "read") where.isRead = true;
    if (status === "unread") where.isRead = false;
    if (status === "archived") where.isArchived = true;
    else where.isArchived = false; // hide archived unless explicitly requested
    if (starred === "true") where.isStarred = true;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/messages
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { senderName, senderEmail, senderPhone, subject, category, priority } = body;
    const text = body.body;

    if (!senderName || !subject || !text) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderName,
        senderEmail: senderEmail || null,
        senderPhone: senderPhone || null,
        subject,
        body: text,
        category: category || "general",
        priority: priority || "normal",
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
