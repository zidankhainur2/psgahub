import MainNav from "@/components/shared/MainNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <div className="flex flex-col min-h-screen w-full">
      <MainNav user={user} />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
