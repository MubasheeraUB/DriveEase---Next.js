import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// GET /api/settings/account  — the currently authenticated user
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const { id, name, email, phone, avatarUrl, role, createdAt } = auth.user;
    return NextResponse.json({ id, name, email, phone, avatarUrl, role, createdAt });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/settings/account  — update profile and/or change password
export async function PUT(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, email, phone, avatarUrl, role, currentPassword, newPassword } = body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (role !== undefined) data.role = role;

    // Email change — ensure uniqueness
    if (email !== undefined && email !== auth.user.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return NextResponse.json({ message: "Email already in use" }, { status: 400 });
      data.email = email;
    }

    // Password change — verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Current password is required" }, { status: 400 });
      }
      const match = await bcrypt.compare(currentPassword, auth.user.password);
      if (!match) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 });
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({ where: { id: auth.user.id }, data });
    const { id, name: n, email: e, phone: p, avatarUrl: a, role: r, createdAt } = updated;
    return NextResponse.json({ id, name: n, email: e, phone: p, avatarUrl: a, role: r, createdAt });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
