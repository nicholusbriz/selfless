// app/dashboard/page.tsx - Keep this file for redirects
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/dashboard/overview');
}