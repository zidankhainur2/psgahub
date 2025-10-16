// app/(main)/profile/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/forms/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, linkedin_url, github_url, avatar_url") 
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detail Profil</CardTitle>
          <CardDescription>
            Perbarui informasi pribadi Anda di sini. Klik simpan setelah
            selesai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
