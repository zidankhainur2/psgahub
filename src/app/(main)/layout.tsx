import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <div className="flex flex-col">
        <Header user={user} profile={profile} />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100/40">
          {children}
        </main>
      </div>
    </div>
  );
}
