import { notFound } from "next/navigation";
import { getInquiry } from "../actions";
import InquiryDetailClient from "./InquiryDetailClient";
import { getSession } from "@/lib/admin/auth";
import { logPersonalInfoAccess } from "@/lib/admin/access-log";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await getInquiry(id);

  if (!inquiry) {
    notFound();
  }

  // Inquiry detail exposes the customer's email/phone, so each view is logged
  // for personal-info access auditing (PIPA / 개인정보보호법 requirement).
  const session = await getSession();
  if (session) {
    await logPersonalInfoAccess({
      adminId: session.id,
      adminName: session.name,
      resource: "inquiry",
      resourceId: id,
    });
  }

  return <InquiryDetailClient inquiry={inquiry} />;
}
