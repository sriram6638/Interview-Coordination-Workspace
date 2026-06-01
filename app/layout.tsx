import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Coordination Workspace",
  description: "Manage and coordinate interviews efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
