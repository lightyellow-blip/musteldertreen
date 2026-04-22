import { getMenusWithContents } from "./actions";
import ContentsClient from "./ContentsClient";

export default async function ContentsPage() {
  const menus = await getMenusWithContents();

  return <ContentsClient initialMenus={menus} />;
}
