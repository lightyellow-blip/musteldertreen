import { getActiveMenus, getSiteSettings } from "@/lib/actions";
import Header from "./Header";
import Footer from "./Footer";

interface Props {
  children: React.ReactNode;
}

export default async function Layout({ children }: Props) {
  const [menus, settings] = await Promise.all([
    getActiveMenus(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header menus={menus} settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer menus={menus} settings={settings} />
    </>
  );
}
