import { notFound } from "next/navigation";
import { getInquiry } from "../actions";
import InquiryDetailClient from "./InquiryDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await getInquiry(id);

  if (!inquiry) {
    notFound();
  }

  return <InquiryDetailClient inquiry={inquiry} />;
}
