import "./globals.css";

import Providers from "@/store/Provider";
import { Loader } from "@/components/loader";

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
    <html lang="th">
      <body style={{ background: "none" }}>
        <Loader>
          <Providers>
            <div>{children}</div>
          </Providers>
        </Loader>
      </body>
    </html>
  );
}
