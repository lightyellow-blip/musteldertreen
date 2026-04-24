import { redirect } from "next/navigation";
import { getSession, isSuperAdmin } from "@/lib/admin/auth";
import AdminsClient from "./AdminsClient";

export default async function AdminsPage() {
  const session = await getSession();

  if (!session || !isSuperAdmin(session)) {
    redirect("/admin");
  }

  return <AdminsClient />;
}
