import "./globals.scss";
import "@rainbow-me/rainbowkit/styles.css";

import { APP_NAME } from "@/constants";
import { Noto_Sans_JP } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "./providers";

const noto_sans_jp = Noto_Sans_JP({ subsets: ["latin"] });

export const metadata = {
  title: APP_NAME,
  description: APP_NAME,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={noto_sans_jp.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
