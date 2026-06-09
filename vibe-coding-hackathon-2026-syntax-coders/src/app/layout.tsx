import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeLink - AI-Powered Healthcare Coordination",
  description: "A nurturing, trustworthy experience. LifeLink combines AI triage, decentralized medical records, and blockchain-verified consent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased"
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FDF6EE] text-[#1E1B2E] selection:bg-[#7C5CBF]/20 selection:text-[#7C5CBF]">{children}</body>
    </html>
  );
}
