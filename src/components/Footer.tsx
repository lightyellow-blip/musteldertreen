import Link from "next/link";

interface Menu {
  id: string;
  label: string;
  href: string;
}

interface Settings {
  siteName: string;
  footerText: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  instagram: string;
  facebook: string;
  youtube: string;
  blog: string;
}

interface Props {
  menus: Menu[];
  settings: Settings;
}

export default function Footer({ menus, settings }: Props) {
  const socialLinks = [
    { name: "Instagram", url: settings.instagram, icon: "instagram" },
    { name: "Facebook", url: settings.facebook, icon: "facebook" },
    { name: "YouTube", url: settings.youtube, icon: "youtube" },
    { name: "Blog", url: settings.blog, icon: "blog" },
  ].filter((link) => link.url);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">{settings.siteName}</h3>
            {settings.address && (
              <p className="text-gray-400 text-sm mb-2">{settings.address}</p>
            )}
            {settings.phone && (
              <p className="text-gray-400 text-sm mb-2">
                Tel. {settings.phone}
              </p>
            )}
            {settings.email && (
              <p className="text-gray-400 text-sm mb-2">{settings.email}</p>
            )}
            {settings.businessHours && (
              <p className="text-gray-400 text-sm">{settings.businessHours}</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              메뉴
            </h4>
            <ul className="space-y-2">
              {menus.map((menu) => (
                <li key={menu.id}>
                  <Link
                    href={menu.href}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                소셜 미디어
              </h4>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white"
                    title={link.name}
                  >
                    <span className="text-sm">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-center text-gray-400 text-sm">
            {settings.footerText ||
              `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
