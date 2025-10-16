import { createClient } from "@/lib/supabase/server";
import SchedulesClient from "./SchedulesClient";
import type { Schedule, Course } from "@/types";

export default async function SchedulesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select("*, courses(name, lecturer)")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("*");

  if (schedulesError || coursesError) {
    return <p className="text-red-500">Gagal memuat data. Coba lagi nanti.</p>;
  }

  return (
    <SchedulesClient
      schedules={schedules as Schedule[]}
      courses={courses as Course[]}
      role={profile?.role || "user"}
    />
  );
}
