import type { Metadata } from "next";
import "./globals.css";

const blankLinkPreviewTitle = "\u200B";

export const metadata: Metadata = {
  metadataBase: new URL("https://voboku.com"),
  title: blankLinkPreviewTitle,
  openGraph: {
    title: blankLinkPreviewTitle,
    url: "https://voboku.com/",
    type: "website",
    images: [
      {
        url: "https://voboku.com/og-white-20260905.png",
        width: 1200,
        height: 630,
        alt: "",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: blankLinkPreviewTitle,
    images: ["https://voboku.com/og-white-20260905.png"],
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
