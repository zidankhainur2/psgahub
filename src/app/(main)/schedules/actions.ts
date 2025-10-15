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

export async function createSchedule(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  console.log("📥 Data form diterima:", rawData);

  const validated = scheduleSchema.safeParse(rawData);

  if (!validated.success) {
    console.error("❌ Validasi gagal:", validated.error.flatten());
    return { error: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;
  console.log("✅ Data tervalidasi:", data);

  const supabase = createClient();
  const { data: inserted, error } = await supabase
    .from("schedules")
    .insert(data)
    .select();

  if (error) {
    console.error("❌ Gagal insert ke Supabase:", error);
    return { error: error.message || "Gagal membuat jadwal." };
  }

  console.log("✅ Jadwal berhasil dibuat:", inserted);
  revalidatePath("/schedules");

  return { message: "Jadwal berhasil dibuat." };
}

export async function deleteSchedule(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    console.error("❌ Gagal hapus:", error);
    return { error: "Gagal menghapus jadwal." };
  }

  revalidatePath("/schedules");
  return { message: "Jadwal berhasil dihapus." };
}
