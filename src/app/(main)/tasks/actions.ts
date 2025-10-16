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

type FormResponse = { success: boolean; message: string };

export async function createTask(formData: FormData): Promise<FormResponse> {
  const validatedFields = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    due_date: formData.get("due_date"),
    status: formData.get("status"),
    course_id: formData.get("course_id"),
  });

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { success: false, message: firstError || "Data tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").insert(validatedFields.data);

    if (error) throw new Error(error.message);

    revalidatePath("/tasks");
    return { success: true, message: "Tugas berhasil dibuat." };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { success: false, message: `Gagal membuat tugas: ${e.message}` };
    }
    return {
      success: false,
      message: "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

export async function updateTask(
  id: number,
  formData: FormData
): Promise<FormResponse> {
  const validatedFields = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    due_date: formData.get("due_date"),
    status: formData.get("status"),
    course_id: formData.get("course_id"),
  });

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { success: false, message: firstError || "Data tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update(validatedFields.data)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/tasks");
    return { success: true, message: "Tugas berhasil diperbarui." };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return {
        success: false,
        message: `Gagal memperbarui tugas: ${e.message}`,
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

export async function deleteTask(id: number): Promise<FormResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/tasks");
    return { success: true, message: "Tugas berhasil dihapus." };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { success: false, message: `Gagal menghapus tugas: ${e.message}` };
    }
    return {
      success: false,
      message: "Terjadi kesalahan yang tidak diketahui",
    };
  }
}
