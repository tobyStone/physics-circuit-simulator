import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoltLab - Interactive Physics & Circuit Laboratory",
  description: "Interactive SQA National 5 Physics circuit simulator and educational laboratory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
