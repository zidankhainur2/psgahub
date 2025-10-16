"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListTodo,
  CalendarDays,
  CircleDollarSign,
  Package2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tugas", icon: ListTodo },
  { href: "/schedules", label: "Jadwal", icon: CalendarDays },
  { href: "/cashflow", label: "Manajemen Kas", icon: CircleDollarSign },
];

export default function SidebarMobile() {
  const pathname = usePathname();

  return (
    <div className="flex-1 overflow-y-auto py-2">
      <nav className="grid items-start px-4 text-sm font-medium">
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
  );
}
