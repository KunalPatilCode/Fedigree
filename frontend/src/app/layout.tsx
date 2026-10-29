import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Fedigree | Family Health Tree & NCD Preventive Care Platform",
  description: "Interactive family health pedigree platform bridging hereditary load, IDRS diabetes risk, and real-time Maharashtra AQI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8FC] text-[#292333] antialiased">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Navbar />
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 min-w-0">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
