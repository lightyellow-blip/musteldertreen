import FloatingHeader from "@/components/front/FloatingHeader";

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingHeader />
      {children}
    </>
  );
}
