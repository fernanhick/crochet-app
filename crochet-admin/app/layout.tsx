import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Crochet Admin",
  description: "Crochet app admin dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#f5f5f5",
          color: "#111",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
