import type { Metadata } from "next";
import { SS4 } from "./ui/fonts";
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
        <div className="p-10">
          <h1 className={`${SS4.className} text-[100px] opacity-50`}>World Cloud</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
