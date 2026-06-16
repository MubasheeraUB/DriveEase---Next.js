import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ message: "Message not found" }, { status: 404 });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/messages/[id]  — update fields or toggle read/star/archive flags
export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Message not found" }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.message.update({
      where: { id },
      data: {
        senderName: body.senderName ?? existing.senderName,
        senderEmail: body.senderEmail ?? existing.senderEmail,
        senderPhone: body.senderPhone ?? existing.senderPhone,
        subject: body.subject ?? existing.subject,
        body: body.body ?? existing.body,
        category: body.category ?? existing.category,
        priority: body.priority ?? existing.priority,
        isRead: body.isRead ?? existing.isRead,
        isStarred: body.isStarred ?? existing.isStarred,
        isArchived: body.isArchived ?? existing.isArchived,
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
    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Message not found" }, { status: 404 });

    await prisma.message.delete({ where: { id } });
    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
