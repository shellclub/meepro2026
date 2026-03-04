import "./globals.css";

import { Kanit } from "next/font/google";
import Providers from "@/store/Provider";
import { Loader } from "@/components/loader";

const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  display: 'swap',
  variable: '--font-kanit',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "MeePro Pet Shop - ร้านขายอาหารและอุปกรณ์สัตว์เลี้ยง",
  description: "MeePro Pet Shop ร้านขายอาหารแมว อุปกรณ์เลี้ยงแมว ของเล่นแมว ทรายแมว ครบครัน คุณภาพดี ราคาถูก",

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="th" className={kanit.variable}>
      <body style={{ background: "none" }} className={kanit.className}>
        <Loader>
          <Providers>
            <div>{children}</div>
          </Providers>
        </Loader>
      </body>
    </html>
  );
}
