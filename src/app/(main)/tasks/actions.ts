"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter."),
  description: z.string().optional(),
  due_date: z.string().min(1, "Tanggal jatuh tempo wajib diisi."),
  status: z.enum(["todo", "in_progress", "done"]),
  course_id: z.coerce.number().min(1, "Mata kuliah wajib dipilih."),
});

export async function createTask(formData: FormData) {
  const validatedFields = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    due_date: formData.get("due_date"),
    status: formData.get("status"),
    course_id: formData.get("course_id"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert(validatedFields.data)
    .single();

  if (error) {
    return { error: "Gagal membuat tugas." };
  }

  revalidatePath("/tasks"); 
  return { message: "Tugas berhasil dibuat." };
}

export async function updateTask(id: number, formData: FormData) {
  const validatedFields = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    due_date: formData.get("due_date"),
    status: formData.get("status"),
    course_id: formData.get("course_id"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update(validatedFields.data)
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui tugas." };
  }

  revalidatePath("/tasks");
  return { message: "Tugas berhasil diperbarui." };
}

export async function deleteTask(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return { error: "Gagal menghapus tugas." };
  }

  revalidatePath("/tasks");
  return { message: "Tugas berhasil dihapus." };
}
