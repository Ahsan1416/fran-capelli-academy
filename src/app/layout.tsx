import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import "./globals.css";
import { getDB } from "@/lib/db";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import StateSelectorModal from "@/components/public/StateSelectorModal";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fca.edu.au'),
  title: {
    default: "Fran Capelli Academy | Vocational Education & Registered Training Organisation (RTO 6055)",
    template: "%s | Fran Capelli Academy"
  },
  description: "Nationally recognised vocational qualifications in Hairdressing, Barbering, Building & Construction, Early Childhood Education & Care, and Community Services across Australia.",
  keywords: ["Fran Capelli Academy", "FCA", "RTO 6055", "Hairdressing Certificate III", "Barbering courses", "Building and Construction CPC40120", "Skills SA funding", "Adelaide courses", "Melbourne hairdressing"],
  icons: {
    icon: "/images/fca/logo.png",
    apple: "/images/fca/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://www.fca.edu.au",
    siteName: "Fran Capelli Academy",
    images: [
      {
        url: "/images/fca/hero-header.png",
        width: 1200,
        height: 630,
        alt: "Fran Capelli Academy",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch site settings from PostgreSQL
  let settings = {};
  try {
    const db = await getDB();
    const res = await db.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1');
    if (res.rows.length > 0) {
      settings = res.rows[0];
    }
  } catch (err) {
    console.error('Failed to load site settings in RootLayout:', err);
  }

  const cookieStore = await cookies();
  const hasState = cookieStore.has('fca_selected_state');
  const initialModalOpen = !hasState;

  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-800 text-[16px] leading-[1.65] relative selection:bg-emerald-600 selection:text-white overflow-x-hidden">
        <StateSelectorModal initialOpen={initialModalOpen} />
        <Navbar settings={settings} />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}

