"use client";

import Link from "next/link";
import { Menu, MoreHorizontal } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SidebarMobile from "./SidebarMobile";
import { Home, ListTodo, CalendarDays, CircleDollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Profile } from "@/types";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tugas", icon: ListTodo },
  { href: "/schedules", label: "Jadwal", icon: CalendarDays },
  { href: "/cashflow", label: "Manajemen Kas", icon: CircleDollarSign },
];

type HeaderProps = {
  user: User | null;
  profile: Pick<Profile, "full_name" | "avatar_url"> | null;
};

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      {/* Sidebar Trigger untuk Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <span>PSGA</span>
            </Link>
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          </SheetHeader>
          <SidebarMobile />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">{/* Bisa diisi Breadcrumbs nanti */}</div>

      {/* User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 rounded-md px-2 w-full max-w-[200px] flex items-center justify-end gap-2"
          >
            {/* Tampilan Desktop: Avatar + Nama */}
            <div className="hidden md:flex flex-col items-end text-left space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || "Pengguna"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || ""}
              />
              <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>

            {/* Tampilan Mobile: Ikon ... */}
            <MoreHorizontal className="h-5 w-5 md:hidden" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Pengaturan</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
