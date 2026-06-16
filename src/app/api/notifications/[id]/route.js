import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/notifications/[id]  — update fields or toggle read flag
export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Notification not found" }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        body: body.body ?? existing.body,
        type: body.type ?? existing.type,
        category: body.category ?? existing.category,
        link: body.link ?? existing.link,
        isRead: body.isRead ?? existing.isRead,
      },
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
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Notification not found" }, { status: 404 });

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
