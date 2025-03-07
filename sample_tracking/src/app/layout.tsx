import "./globals.css";

import { Inter } from "next/font/google";
import Nav from "../old_components/nav";
import TopBar from "../old_components/top_bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sample Collection",
  description: "App for sample collection and tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <TopBar />
        <Nav />
        {children}
      </body>
    </html>
  );
}
