import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "./audio-context";
import { Nav } from "./nav";
import { NowPlaying } from "./now-playing";

export const metadata: Metadata = {
  title: "alex plain",
  description: "tracks and releases.",
  openGraph: {
    title: "alex plain",
    description: "tracks and releases",
    url: "https://alexplain.me",
    siteName: "alex plain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen">
        <AudioProvider>
          <div className="flex flex-col min-h-screen max-w-3xl mx-auto px-6 pb-20">
            <Nav />
            <main className="flex-grow mb-12">{children}</main>
          </div>
          <NowPlaying />
        </AudioProvider>
      </body>
    </html>
  );
}
