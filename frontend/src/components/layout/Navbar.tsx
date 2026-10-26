"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePedigreeStore } from "@/store/pedigreeStore";
import { translations, Language } from "@/lib/translations";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = usePedigreeStore();
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.navHome },
    { href: "/tree", label: t.navTree },
    { href: "/assess", label: t.navAssess },
    { href: "/profile", label: t.navProfile },
    { href: "/predict", label: t.navPredict },
    { href: "/report", label: t.navReport },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-xl md:backdrop-blur-2xl border-b border-white/40 shadow-[0_4px_30px_rgba(69,38,83,0.03)] font-editorial">
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-12 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center shrink-0 w-[180px] lg:w-[220px]">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/fedigree-logo-cropped.png"
              alt="Fedigree"
              width={160}
              height={44}
              priority
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Centered, Editorial Serif, Zero Layout Shift) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1"
        >
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-3.5 xl:px-4 py-1.5 rounded-xl text-base xl:text-[17px] font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-200 ${
                  isActive
                    ? "bg-white/85 text-[#281432] shadow-[0_2px_12px_rgba(69,38,83,0.12)] border border-[#452653]/15 scale-[1.03]"
                    : "text-[#4a3b57] hover:text-[#281432] hover:bg-white/40 border border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Switcher & Mobile Menu Toggle */}
        <div className="flex items-center justify-end gap-2 shrink-0 w-[180px] lg:w-[220px]">
          {/* Language Switcher (Text Only, Translucent Glass) */}
          <div className="flex items-center bg-white/40 backdrop-blur-md p-1 rounded-xl shadow-xs border border-white/50 font-sans text-xs">
            {(["en", "mr", "hi"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-colors duration-150 ${
                  language === lang
                    ? "bg-white/90 text-[#281432] shadow-xs font-semibold"
                    : "text-[#5e546b] hover:text-[#281432]"
                }`}
                title={`Switch language to ${lang.toUpperCase()}`}
              >
                {lang === "en" ? "EN" : lang === "mr" ? "मराठी" : "हिंदी"}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden p-2 rounded-xl text-[#3e344a] hover:text-[#1a1222] hover:bg-white/40 transition-colors border-none"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#452653]" />
            ) : (
              <Menu className="w-5 h-5 text-[#452653]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown (Editorial Serif, Translucent Glass) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/75 backdrop-blur-2xl px-4 py-3 shadow-xl border-b border-white/40">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-white/90 text-[#281432] shadow-xs border border-[#452653]/15"
                      : "text-[#3e344a] hover:text-[#1a1222] hover:bg-white/40 border border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
