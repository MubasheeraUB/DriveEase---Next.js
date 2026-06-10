import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const {
      vehicleName, vehicleNumber, vehicleType, brand, model, fuelType,
      registrationDate, insuranceExpiry, rcExpiry, pollutionExpiry, seatingCapacity,
    } = await request.json();

    const existingVehicle = await prisma.vehicle.findUnique({ where: { vehicleNumber } });
    if (existingVehicle) {
      return NextResponse.json({ message: "Vehicle already exists" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleName, vehicleNumber, vehicleType, brand, model, fuelType,
        registrationDate: new Date(registrationDate),
        insuranceExpiry: new Date(insuranceExpiry),
        rcExpiry: new Date(rcExpiry),
        pollutionExpiry: new Date(pollutionExpiry),
        seatingCapacity,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
