import { redirect } from "next/navigation";
import { getSession, isSuperAdmin } from "@/lib/auth";
import IpManagementClient from "./IpManagementClient";

export default async function IpManagementPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isSuperAdmin(session)) {
    redirect("/admin");
  }

  return <IpManagementClient />;
}
