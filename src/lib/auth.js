import jwt from "jsonwebtoken";
import prisma from "./prisma";
import { NextResponse } from "next/server";

/**
 * Generate a JWT token for a user id.
 */
export function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Extract and verify the Bearer token from a Next.js Request.
 * Returns the full user object on success, or a NextResponse 401 on failure.
 */
export async function authenticate(request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ message: "No token" }, { status: 401 }),
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return {
        error: NextResponse.json({ message: "Not authorized" }, { status: 401 }),
      };
    }

    return { user };
  } catch {
    return {
      error: NextResponse.json({ message: "Not authorized" }, { status: 401 }),
    };
  }
}
