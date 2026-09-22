import type { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "World Cloud",
  description: "A summary of the Internet's gestalt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="p-5 h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
