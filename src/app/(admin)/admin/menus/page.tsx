import { getMenus } from "./actions";
import MenusClient from "./MenusClient";

export default async function MenusPage() {
  const menus = await getMenus();

  return <MenusClient initialMenus={menus} />;
}
