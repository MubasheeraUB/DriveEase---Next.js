import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

// Fetch the singleton profile, creating defaults if none exists.
async function getOrCreateProfile() {
  let profile = await prisma.schoolProfile.findFirst();
  if (!profile) profile = await prisma.schoolProfile.create({ data: {} });
  return profile;
}

// GET /api/settings/profile
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const profile = await getOrCreateProfile();
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/settings/profile
export async function PUT(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const profile = await getOrCreateProfile();

    const allowed = [
      "schoolName", "tagline", "email", "phone", "alternatePhone", "website",
      "registrationNumber", "logoUrl", "addressLine", "city", "state", "pincode",
      "country", "currency", "currencySymbol", "timezone",
      "workingHoursStart", "workingHoursEnd", "workingDays",
    ];
    const data = {};
    for (const key of allowed) if (body[key] !== undefined) data[key] = body[key];
    if (body.establishedYear !== undefined) {
      data.establishedYear = body.establishedYear ? parseInt(body.establishedYear) : null;
    }

    const updated = await prisma.schoolProfile.update({ where: { id: profile.id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
