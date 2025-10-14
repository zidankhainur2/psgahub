"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function MainNav({ user }: { user: User | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold text-gray-800">
          PSGA
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Dashboard
          </Link>
          <Link
            href="/tasks"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Tugas
          </Link>
          <Link
            href="/schedules"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Jadwal
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Profil
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
}
