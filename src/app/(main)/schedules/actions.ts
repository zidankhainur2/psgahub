"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const scheduleSchema = z.object({
  course_id: z.coerce.number().min(1, "Mata kuliah wajib dipilih."),
  day_of_week: z.coerce.number().min(1).max(7, "Hari wajib dipilih."),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid."),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid."),
  location: z.string().min(2, "Lokasi minimal 2 karakter."),
});

type FormResponse = { success: boolean; message: string };

export async function createSchedule(
  formData: FormData
): Promise<FormResponse> {
  const validatedFields = scheduleSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { success: false, message: firstError || "Data tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("schedules")
      .insert(validatedFields.data);
    if (error) throw new Error(error.message);

    revalidatePath("/schedules");
    return { success: true, message: "Jadwal berhasil dibuat." };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { success: false, message: `Gagal membuat jadwal: ${e.message}` };
    }
    return {
      success: false,
      message: "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

export async function deleteSchedule(id: number): Promise<FormResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/schedules");
    return { success: true, message: "Jadwal berhasil dihapus." };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return {
        success: false,
        message: `Gagal menghapus jadwal: ${e.message}`,
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan yang tidak diketahui",
    };
  }
}
