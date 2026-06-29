import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "SomeoneOS | Your Autonomous Personal Chief of Staff",
  description: "Your autonomous personal chief of staff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col font-sans antialiased selection:bg-neutral-200 selection:text-neutral-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

