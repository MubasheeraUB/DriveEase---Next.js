import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });

    const {
      vehicleName, vehicleNumber, vehicleType, brand, model, fuelType,
      registrationDate, insuranceExpiry, rcExpiry, pollutionExpiry,
      seatingCapacity, status, availability,
    } = await request.json();

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        vehicleName, vehicleNumber, vehicleType, brand, model, fuelType,
        registrationDate: new Date(registrationDate),
        insuranceExpiry: new Date(insuranceExpiry),
        rcExpiry: new Date(rcExpiry),
        pollutionExpiry: new Date(pollutionExpiry),
        seatingCapacity, status, availability,
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
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });

    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
