import { createClient } from "@/lib/supabase/server";
import TasksClient from "./TasksClient";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  status: "todo" | "in_progress" | "done";
  course_id: number;
  courses: { name: string } | null;
};

export type Course = {
  id: number;
  name: string;
};

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

  return <TasksClient tasks={tasks || []} courses={courses || []} />;
}
