"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  ListTodo,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tugas", icon: ListTodo },
  { href: "/schedules", label: "Jadwal", icon: CalendarDays },
  { href: "/cashflow", label: "Manajemen Kas", icon: CircleDollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">PSGA</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === link.href && "bg-muted text-primary"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
