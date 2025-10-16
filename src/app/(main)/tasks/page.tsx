import { createClient } from "@/lib/supabase/server";
import TasksClient from "./TasksClient";
import type { Task, Course } from "@/types";

export default async function TasksPage() {
  const supabase = createClient();

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*, courses(name)")
    .order("due_date", { ascending: true });

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("*");

  if (tasksError || coursesError) {
    return <p className="text-red-500">Gagal memuat data. Coba lagi nanti.</p>;
  }

  return (
    <TasksClient
      tasks={(tasks as Task[]) || []}
      courses={(courses as Course[]) || []}
    />
  );
}
