import "./globals.css";
import { Inter } from "next/font/google";
import Nav from "./nav";
import TopBar from "./top_bar";

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
    <html lang="pt">
      <body className={inter.className}>
        <div className="grid grid-rows-[68px_1fr] h-screen">
          <div>
            <TopBar />
            <Nav />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
