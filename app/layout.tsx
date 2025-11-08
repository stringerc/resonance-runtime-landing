import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display" });
const jetBrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const metadata: Metadata = {
  title: "Resonance Calculus Platform",
  description: "Enterprise-grade performance analytics and monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable} ${jetBrains.variable}`}>
        <Providers>{children}</Providers>
        {intercomAppId && (
          <>
            <Script id="intercom-settings" strategy="lazyOnload">
              {`window.intercomSettings = { app_id: '${intercomAppId}' };`}
            </Script>
            <Script
              id="intercom-widget"
              strategy="lazyOnload"
              src={`https://widget.intercom.io/widget/${intercomAppId}`}
            />
          </>
        )}
      </body>
    </html>
  );
}


