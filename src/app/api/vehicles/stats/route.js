import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const [total, active, available, allVehicles] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "active" } }),
      prisma.vehicle.count({ where: { availability: "available" } }),
      prisma.vehicle.findMany({
        select: { vehicleType: true, fuelType: true, status: true, insuranceExpiry: true, rcExpiry: true, pollutionExpiry: true },
      }),
    ]);

    // Type distribution
    const typeMap = {};
    allVehicles.forEach(v => { typeMap[v.vehicleType] = (typeMap[v.vehicleType] || 0) + 1; });
    const typeDistribution = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // Fuel distribution
    const fuelMap = {};
    allVehicles.forEach(v => { fuelMap[v.fuelType] = (fuelMap[v.fuelType] || 0) + 1; });
    const fuelDistribution = Object.entries(fuelMap).map(([name, value]) => ({ name, value }));

    // Status distribution
    const statusMap = {};
    allVehicles.forEach(v => { statusMap[v.status] = (statusMap[v.status] || 0) + 1; });
    const statusDistribution = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Expiring in next 30 days
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringInsurance = allVehicles.filter(v => v.insuranceExpiry && new Date(v.insuranceExpiry) <= in30).length;
    const expiringRc        = allVehicles.filter(v => v.rcExpiry        && new Date(v.rcExpiry)        <= in30).length;
    const expiringPollution = allVehicles.filter(v => v.pollutionExpiry && new Date(v.pollutionExpiry) <= in30).length;

    return NextResponse.json({
      total, active, available,
      inactive: total - active,
      typeDistribution, fuelDistribution, statusDistribution,
      expiringInsurance, expiringRc, expiringPollution,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
