import "./globals.css";

export const metadata = {
  title: "DriveEase — Smart Driving Institute Management",
  description: "Manage students, instructors, vehicles, schedules, and payments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
