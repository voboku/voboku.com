import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://voboku.com"),
  title: "Sound Objects — Music Plugins",
  description:
    "A mobile collection of experimental music plugins and playable sound objects.",
  openGraph: {
    title: "Sound Objects — Music Plugins",
    description:
      "A mobile collection of experimental music plugins and playable sound objects.",
    url: "https://voboku.com/",
    type: "website",
    images: [
      {
        url: "https://voboku.com/og.png",
        width: 1200,
        height: 630,
        alt: "Sound Objects music operating system",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sound Objects — Music Plugins",
    description:
      "A mobile collection of experimental music plugins and playable sound objects.",
    images: ["https://voboku.com/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
