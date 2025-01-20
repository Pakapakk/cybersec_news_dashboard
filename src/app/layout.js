import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import font configurations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the layout
export const metadata = {
  title: "CyberSec News Dashboard",
  description: "Generated by create next app",
};

// Import common components
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ display: "flex", height: "100vh" }}
      >
        <Sidebar />
        <Header />
        <main style={{ flexGrow: 1 }}>{children}</main>
      </body>
    </html>
  );
}
