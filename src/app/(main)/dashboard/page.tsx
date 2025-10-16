import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ListTodo,
  CalendarCheck2,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const getDaysLeft = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Terlewat", color: "text-red-500" };
  if (diffDays === 0) return { text: "Hari ini", color: "text-yellow-600" };
  if (diffDays === 1) return { text: "Besok", color: "text-blue-500" };
  return { text: `${diffDays} hari lagi`, color: "text-gray-500" };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const [
    profileRes,
    unfinishedTasksRes,
    todaySchedulesRes,
    upcomingTasksRes,
    cashFlowRes,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .neq("status", "done"),
    supabase
      .from("schedules")
      .select("*, courses(name, lecturer)")
      .eq("day_of_week", dayOfWeek)
      .order("start_time"),
    supabase
      .from("tasks")
      .select("*, courses(name)")
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(3),
    supabase.from("cash_flow").select("amount, type"),
  ]);

  const profile = profileRes.data;
  const unfinishedTasksCount = unfinishedTasksRes.count;
  const todaySchedules = todaySchedulesRes.data;
  const upcomingTasks = upcomingTasksRes.data;
  const cashFlowData = cashFlowRes.data;

  // Hitung saldo kas
  let totalIncome = 0;
  let totalExpense = 0;
  cashFlowData?.forEach((t) => {
    if (t.type === "income") {
      totalIncome += Number(t.amount);
    } else {
      totalExpense += Number(t.amount);
    }
  });
  const balance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Selamat Datang, {profile?.full_name || user.email}!
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Berikut adalah ringkasan aktivitasmu hari ini.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Aktif</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unfinishedTasksCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tugas yang belum selesai.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jadwal Hari Ini
            </CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaySchedules?.length ?? 0} Mata Kuliah
            </div>
            <p className="text-xs text-muted-foreground">
              Jadwal untuk hari ini.
            </p>
          </CardContent>
        </Card>
        <Link href="/cashflow">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kas Kelompok
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Klik untuk melihat detail transaksi.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedules && todaySchedules.length > 0 ? (
              <div className="space-y-4">
                {todaySchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-4">
                    <div className="flex-none text-center rounded-md bg-muted px-3 py-1">
                      <p className="text-sm font-semibold">
                        {schedule.start_time.slice(0, 5)}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">{schedule.courses?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.courses?.lecturer} • {schedule.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Tidak ada jadwal hari ini. Selamat beristirahat!
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Tugas Terdekat</CardTitle>
              <CardDescription>
                3 tugas dengan tenggat paling dekat.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/tasks">
                Lihat Semua
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingTasks && upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map((task) => {
                  const daysLeftInfo = getDaysLeft(task.due_date);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.courses?.name || "Umum"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          daysLeftInfo.text === "Terlewat"
                            ? "destructive"
                            : "outline"
                        }
                        className={daysLeftInfo.color}
                      >
                        {daysLeftInfo.text}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Tidak ada tugas yang perlu dikerjakan. Hebat!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
