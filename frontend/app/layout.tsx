import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-ui" });
export const metadata: Metadata = { title: { default: "SkillPath — ค้นหาเส้นทางของคุณ", template: "%s | SkillPath" }, description: "ประเมินทักษะ วิเคราะห์ Skill Gap และสร้างเส้นทางการเรียนรู้ที่เหมาะกับสายอาชีพของคุณ", icons: { icon: "/images/skillpath-logo.png", apple: "/images/skillpath-logo.png" } };

import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={noto.variable}>
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
