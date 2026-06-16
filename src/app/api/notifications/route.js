import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/notifications?search=&type=&category=&status=&page=&limit=
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || ""; // read | unread
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) where.type = { equals: type, mode: "insensitive" };
    if (category) where.category = { equals: category, mode: "insensitive" };
    if (status === "read") where.isRead = true;
    if (status === "unread") where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/notifications
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { title, type, category, link } = body;
    const text = body.body;

    if (!title || !text) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        body: text,
        type: type || "info",
        category: category || "system",
        link: link || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PATCH /api/notifications  — bulk action: mark all read
export async function PATCH(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === "markAllRead") {
      const result = await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ updated: result.count });
    }
    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
