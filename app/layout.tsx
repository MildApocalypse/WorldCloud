import type { Metadata } from "next";
import "./globals.css"
import Link from "next/link";

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
      <body className="h-full flex flex-col">
        <div className="h-7 border-b-2 border-b-blue-200/50 bg-blend-color-burn
        [&_a]:p-1 [&_a]:text-[15px] [&_a]:opacity-75 ">
          <Link href="/" className="pl-10!">Home</Link>
          <Link href="/about">About</Link>
        </div>
        <main className="flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}
