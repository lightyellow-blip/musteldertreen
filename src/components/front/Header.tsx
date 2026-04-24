"use client";

import Link from "next/link";
import { useState } from "react";

interface Menu {
  id: string;
  label: string;
  href: string;
  children?: Menu[];
}

interface Settings {
  siteName: string;
  logoUrl: string;
}

interface Props {
  menus: Menu[];
  settings: Settings;
}

export default function Header({ menus, settings }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {settings.siteName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => setOpenSubmenu(menu.id)}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                <Link
                  href={menu.href}
                  className="text-gray-700 hover:text-gray-900 font-medium py-2"
                >
                  {menu.label}
                </Link>

                {/* Submenu */}
                {menu.children && menu.children.length > 0 && (
                  <div
                    className={`absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] transition-all ${
                      openSubmenu === menu.id
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    {menu.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {menus.map((menu) => (
              <div key={menu.id}>
                <Link
                  href={menu.href}
                  className="block py-2 text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menu.label}
                </Link>
                {menu.children &&
                  menu.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className="block py-2 pl-4 text-sm text-gray-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
