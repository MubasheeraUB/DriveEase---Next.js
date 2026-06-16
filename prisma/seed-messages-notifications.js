// Seed sample Messages & Notifications so the new modules show live data.
// Run with:  node prisma/seed-messages-notifications.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const messages = [
  { senderName: "Aarav Sharma", senderEmail: "aarav@example.com", senderPhone: "9876543210", subject: "Course timing query", body: "Hi, can I switch my LMV classes to evening slots next week?", category: "inquiry", priority: "normal", isRead: false },
  { senderName: "Priya Patel", senderEmail: "priya@example.com", senderPhone: "9123456780", subject: "Instructor was excellent", body: "Just wanted to say my instructor Rohit was very patient and helpful. Thank you!", category: "feedback", priority: "low", isRead: false, isStarred: true },
  { senderName: "Imran Khan", senderPhone: "9988776655", subject: "Refund not processed", body: "I cancelled my enrollment last week but haven't received my refund yet. Please check.", category: "complaint", priority: "high", isRead: false },
  { senderName: "Sneha Reddy", senderEmail: "sneha@example.com", subject: "Need duplicate invoice", body: "Could you email me a copy of my last payment invoice for reimbursement?", category: "support", priority: "normal", isRead: true },
  { senderName: "Vikram Singh", senderPhone: "9001122334", subject: "Heavy vehicle course details", body: "What documents do I need to enroll for the heavy vehicle training program?", category: "inquiry", priority: "normal", isRead: true },
  { senderName: "Anonymous Visitor", senderEmail: "info@webform.com", subject: "Website contact form", body: "Do you offer weekend batches? Looking to start as soon as possible.", category: "general", priority: "normal", isRead: false },
];

const notifications = [
  { title: "Payment overdue", body: "Aarav Sharma has a pending balance of ₹4,500 due 3 days ago.", type: "warning", category: "payment", link: "/payments", isRead: false },
  { title: "New enrollment", body: "Sneha Reddy enrolled in the LMV Standard package.", type: "success", category: "enrollment", link: "/students", isRead: false },
  { title: "Class scheduled today", body: "5 training sessions are scheduled for today.", type: "info", category: "schedule", link: "/training-schedules", isRead: false },
  { title: "License expiring soon", body: "Instructor Rohit Verma's license expires in 15 days.", type: "warning", category: "license", link: "/instructors", isRead: false },
  { title: "Vehicle service due", body: "MH-12-AB-1234 insurance expires next week.", type: "error", category: "vehicle", link: "/vehicles", isRead: false },
  { title: "Daily summary ready", body: "Yesterday: 3 new enrollments, ₹22,000 collected.", type: "info", category: "system", isRead: true },
  { title: "Payment received", body: "₹8,000 received from Priya Patel via UPI.", type: "success", category: "payment", link: "/payments", isRead: true },
];

async function main() {
  for (const m of messages) await prisma.message.create({ data: m });
  for (const n of notifications) await prisma.notification.create({ data: n });
  console.log(`Seeded ${messages.length} messages and ${notifications.length} notifications.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
