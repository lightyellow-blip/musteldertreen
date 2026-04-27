export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html,body{overflow:hidden;height:100svh;}`}</style>
      {children}
    </>
  );
}
