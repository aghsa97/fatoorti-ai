"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "الفواتير", icon: FileText },
  { href: "/new", label: "إنشاء", icon: Plus },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-arabic font-bold text-sm">ف</span>
          </div>
          <span className="font-arabic font-semibold text-foreground">
            فاتورتي
          </span>
          <span className="text-[10px] font-inter font-medium text-accent border border-accent/30 rounded px-1 py-0.5 leading-none">
            AI
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-btn text-sm font-arabic transition-colors",
                  isActive
                    ? "bg-accent/5 text-accent font-medium border border-accent/20"
                    : "text-muted hover:text-foreground hover:bg-black/[0.02]"
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted hover:text-foreground rounded-btn transition-colors">
            <Bell size={18} strokeWidth={1.5} />
          </button>
          <Link
            href="/settings"
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              pathname === "/settings"
                ? "bg-accent text-white"
                : "bg-foreground/10 hover:bg-foreground/15"
            )}
          >
            <span className="text-xs font-arabic font-medium">س</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
