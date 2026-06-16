import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

async function getOrCreateNotifications() {
  let setting = await prisma.notificationSetting.findFirst();
  if (!setting) setting = await prisma.notificationSetting.create({ data: {} });
  return setting;
}

// GET /api/settings/notifications
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const setting = await getOrCreateNotifications();
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/settings/notifications
export async function PUT(request) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const setting = await getOrCreateNotifications();

    const bools = [
      "emailEnabled", "smsEnabled", "inAppEnabled",
      "paymentDueAlert", "scheduleReminder", "newEnrollmentAlert",
      "licenseExpiryAlert", "vehicleServiceAlert", "dailySummary",
    ];
    const data = {};
    for (const k of bools) if (body[k] !== undefined) data[k] = Boolean(body[k]);

    const updated = await prisma.notificationSetting.update({ where: { id: setting.id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
