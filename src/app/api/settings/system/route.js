import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

async function getOrCreateSystem() {
  let setting = await prisma.systemSetting.findFirst();
  if (!setting) setting = await prisma.systemSetting.create({ data: {} });
  return setting;
}

// GET /api/settings/system
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const setting = await getOrCreateSystem();
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/settings/system
export async function PUT(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const setting = await getOrCreateSystem();

    const floats = ["defaultCourseFee", "lateFeePercentage"];
    const ints = ["defaultSessionMins", "maxStudentsPerBatch", "paymentReminderDays"];
    const bools = ["autoAssignInstructor", "lateFeeEnabled", "maintenanceMode"];
    const strings = ["dateFormat", "invoicePrefix"];

    const data = {};
    for (const k of floats) if (body[k] !== undefined) data[k] = parseFloat(body[k]);
    for (const k of ints) if (body[k] !== undefined) data[k] = parseInt(body[k]);
    for (const k of bools) if (body[k] !== undefined) data[k] = Boolean(body[k]);
    for (const k of strings) if (body[k] !== undefined) data[k] = body[k];

    const updated = await prisma.systemSetting.update({ where: { id: setting.id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
