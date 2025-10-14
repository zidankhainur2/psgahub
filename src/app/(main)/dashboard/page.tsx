import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Selamat Datang, {profile?.full_name || user.email}!
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tugas Mendatang</CardTitle>
            <CardDescription>
              Lihat semua tugas yang akan datang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Anda memiliki 3 tugas yang belum selesai.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
            <CardDescription>
              Lihat jadwal kuliah untuk hari ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Tidak ada jadwal hari ini.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kas Kelompok</CardTitle>
            <CardDescription>Lihat status keuangan kelompok.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Saldo saat ini: Rp 500.000</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
