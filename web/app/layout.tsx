import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ThreeBackground from "@/components/ThreeBackground";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digit Recognizer | CNN",
  description:
    "Draw a handwritten digit and let our Convolutional Neural Network predict it in real-time.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-neutral-950 text-neutral-100 font-sans">
        {/* 3D background — fixed, outside Lenis */}
        <ThreeBackground />

        {/* Everything that scrolls goes inside SmoothScroll */}
        <SmoothScroll>
          <AppShell>{children}</AppShell>
        </SmoothScroll>
      </body>
    </html>
  );
}