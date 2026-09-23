import { getIsAdmin } from "@/lib/auth";
import { getFullContent } from "@/lib/content";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

// Check auth + load data server-side so the admin panel appears instantly
// instead of waiting on client-side Firebase Auth + Firestore round trips.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const authed = await getIsAdmin();
  if (!authed) {
    return <AdminLogin />;
  }
  const data = await getFullContent();
  return <AdminDashboard initialData={data} />;
}
