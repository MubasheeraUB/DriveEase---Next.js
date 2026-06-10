import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) return NextResponse.json({ message: "Driver not found" }, { status: 404 });
    return NextResponse.json(driver);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.driver.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Driver not found" }, { status: 404 });

    const {
      fullName, email, phone, licenseNumber, licenseExpiry,
      vehicleType, experienceYears, address, availability, status,
    } = await request.json();

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        fullName, email, phone, licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        vehicleType, experienceYears, address, availability, status,
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
    const existing = await prisma.driver.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Driver not found" }, { status: 404 });

    await prisma.driver.delete({ where: { id } });
    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
