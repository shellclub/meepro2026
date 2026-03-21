import "./coming-soon.css";

export const metadata = {
  title: "MeePro Pet Shop - เร็วๆ นี้ | Coming Soon",
  description: "MeePro Pet Shop ร้านขายอาหารแมว อุปกรณ์เลี้ยงแมว ของเล่นแมว ทรายแมว กำลังจะกลับมาพร้อมประสบการณ์ใหม่ที่ดีกว่าเดิม",
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
