import { getInquiries, getInquiryStats } from "./actions";
import InquiriesClient from "./InquiriesClient";

export default async function InquiriesPage() {
  const [inquiries, stats] = await Promise.all([
    getInquiries(),
    getInquiryStats(),
  ]);

  return <InquiriesClient initialInquiries={inquiries} initialStats={stats} />;
}
