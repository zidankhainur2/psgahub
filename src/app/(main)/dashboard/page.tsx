import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

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

  const { count: unfinishedTasksCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .neq("status", "done");

  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const { data: todaySchedules } = await supabase
    .from("schedules")
    .select("*, courses(name)")
    .eq("day_of_week", dayOfWeek)
    .order("start_time");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Selamat Datang, {profile?.full_name || user.email}!
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Kartu Tugas Dinamis */}
        <Link href="/tasks">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader>
              <CardTitle>Tugas Mendatang</CardTitle>
              <CardDescription>
                Jumlah tugas yang belum selesai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {unfinishedTasksCount ?? 0} Tugas
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Kartu Jadwal Dinamis */}
        <Link href="/schedules">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader>
              <CardTitle>Jadwal Hari Ini</CardTitle>
              <CardDescription>Jadwal kuliah untuk hari ini.</CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedules && todaySchedules.length > 0 ? (
                <ul className="space-y-2">
                  {todaySchedules.map((schedule) => (
                    <li key={schedule.id} className="text-sm">
                      <strong>{schedule.start_time.slice(0, 5)}:</strong>{" "}
                      {schedule.courses?.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Tidak ada jadwal hari ini. Selamat beristirahat!</p>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Kartu Kas sudah dinamis */}
        <Link href="/cashflow">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Kas Kelompok</CardTitle>
              <CardDescription>
                Pantau pemasukan dan pengeluaran.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Klik untuk melihat detail transaksi kas.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
