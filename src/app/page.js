import { redirect } from 'next/navigation';

export default function RootPage() {
  // redirect('/home'); // เปิดใช้เมื่อเว็บไซต์พร้อมให้บริการ
  redirect('/coming-soon');
  return null;
}