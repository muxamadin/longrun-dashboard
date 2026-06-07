import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Long Run Trucking — Dashboard",
  description: "Mike HR — Long Run Trucking LLC Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#060B18', color: '#F0F6FF', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
