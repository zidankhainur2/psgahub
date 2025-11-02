"use server";

import { createClient } from "@/lib/supabase/server";
import { FormResponse } from "@/types/actions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Skema validasi untuk form pembuatan grup
const createGroupSchema = z.object({
  name: z.string().min(3, "Nama grup minimal 3 karakter."),
  course_id: z.coerce
    .number()
    .positive("Mata kuliah harus dipilih.")
    .optional() // Dibuat opsional di schema, tapi akan divalidasi required di form jika perlu
    .nullable(),
});

// Helper function untuk cek role admin (mirip di cashflow actions)
async function isAdminCheck() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Autentikasi diperlukan.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Akses ditolak: Hanya admin yang bisa melakukan aksi ini.");
  }
  return user.id; // Kembalikan user id jika admin
}

export async function createGroup(formData: FormData): Promise<FormResponse> {
  let adminUserId: string;
  try {
    adminUserId = await isAdminCheck();
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memverifikasi admin.",
    };
  }

  const validatedFields = createGroupSchema.safeParse({
    name: formData.get("name"),
    course_id: formData.get("course_id")
      ? Number(formData.get("course_id"))
      : null,
  });

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { success: false, message: firstError || "Data input tidak valid." };
  }

  const { name, course_id } = validatedFields.data;

  try {
    const supabase = await createClient(); //

    // LANGKAH 1: Buat grup dan dapatkan ID-nya kembali
    const { data: newGroup, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        course_id: course_id,
        created_by: adminUserId,
      })
      .select("id") // Minta Supabase mengembalikan ID dari baris yang baru dibuat
      .single(); // Kita tahu kita hanya membuat satu

    if (groupError) throw new Error(`Gagal buat grup: ${groupError.message}`);
    if (!newGroup)
      throw new Error("Gagal mendapatkan ID grup yang baru dibuat.");

    // LANGKAH 2: Tambahkan admin sebagai 'leader' ke grup baru ini
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: newGroup.id,
      user_id: adminUserId,
      role: "leader", // Jadikan pembuatnya sebagai leader
    });

    if (memberError) {
      // Jika penambahan anggota gagal, idealnya kita hapus grup yang baru dibuat (rollback)
      // Tapi untuk sekarang, kita laporkan saja errornya
      throw new Error(
        `Grup dibuat, tapi gagal menambahkan admin sebagai leader: ${memberError.message}`
      );
    }

    revalidatePath("/groups"); //
    return {
      success: true,
      message:
        "Grup berhasil dibuat (dan Anda telah ditambahkan sebagai 'leader').",
    };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Terjadi kesalahan tidak diketahui.";
    return { success: false, message: `Gagal membuat grup: ${message}` };
  }
}
// --- AKHIR FUNGSI YANG DIPERBARUI ---

const addMemberSchema = z.object({
  group_id: z.coerce.number().positive("ID Grup tidak valid."),
  user_id: z.string().uuid("User ID tidak valid."),
  role: z.enum(["member", "leader"], {
    message: "Peran harus 'member' atau 'leader'.",
  }),
});

export async function addMemberToGroup(
  formData: FormData
): Promise<FormResponse> {
  try {
    await isAdminCheck(); // Hanya admin yang bisa menambah anggota
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memverifikasi admin.",
    };
  }

  const validatedFields = addMemberSchema.safeParse({
    group_id: formData.get("group_id"),
    user_id: formData.get("user_id"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { success: false, message: firstError || "Data input tidak valid." };
  }

  const { group_id, user_id, role } = validatedFields.data;

  try {
    const supabase = await createClient(); //

    // Cek apakah user sudah jadi anggota
    const { data: existing, error: checkError } = await supabase
      .from("group_members")
      .select()
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);
    if (existing) {
      return {
        success: false,
        message: "Pengguna ini sudah menjadi anggota grup.",
      };
    }

    // Jika peran adalah 'leader', cek apakah sudah ada leader
    if (role === "leader") {
      const { data: existingLeader, error: leaderCheckError } = await supabase
        .from("group_members")
        .select()
        .eq("group_id", group_id)
        .eq("role", "leader")
        .limit(1);

      if (leaderCheckError) throw new Error(leaderCheckError.message);
      if (existingLeader && existingLeader.length > 0) {
        return {
          success: false,
          message:
            "Grup ini sudah memiliki Ketua. Jadikan 'member' terlebih dahulu.",
        };
      }
    }

    // Tambahkan anggota baru
    const { error: insertError } = await supabase
      .from("group_members")
      .insert({ group_id, user_id, role });

    if (insertError) throw new Error(insertError.message);

    revalidatePath(`/groups/${group_id}`); // Refresh halaman detail grup
    return { success: true, message: "Anggota berhasil ditambahkan." };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Terjadi kesalahan tidak diketahui.";
    return { success: false, message: `Gagal menambahkan anggota: ${message}` };
  }
}

const removeMemberSchema = z.object({
  group_id: z.coerce.number().positive(),
  user_id: z.string().uuid(),
});

export async function removeMemberFromGroup(
  formData: FormData
): Promise<FormResponse> {
  let adminUserId: string;
  try {
    adminUserId = await isAdminCheck(); // Pastikan admin
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memverifikasi admin.",
    };
  }

  const validatedFields = removeMemberSchema.safeParse({
    group_id: formData.get("group_id"),
    user_id: formData.get("user_id"),
  });

  if (!validatedFields.success) {
    return { success: false, message: "Input tidak valid." };
  }

  const { group_id, user_id } = validatedFields.data;

  // Pencegahan agar admin tidak bisa mengeluarkan dirinya sendiri
  if (user_id === adminUserId) {
    return {
      success: false,
      message: "Admin tidak bisa mengeluarkan dirinya sendiri.",
    };
  }

  try {
    const supabase = await createClient(); //
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", group_id)
      .eq("user_id", user_id);

    if (error) throw new Error(error.message);

    revalidatePath(`/groups/${group_id}`);
    return { success: true, message: "Anggota berhasil dikeluarkan." };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return {
      success: false,
      message: `Gagal mengeluarkan anggota: ${message}`,
    };
  }
}

// --- FUNGSI BARU UNTUK UPDATE PERAN ANGGOTA ---
const updateRoleSchema = z.object({
  group_id: z.coerce.number().positive(),
  user_id: z.string().uuid(),
  new_role: z.enum(["member", "leader"]),
});

export async function updateMemberRole(
  formData: FormData
): Promise<FormResponse> {
  try {
    await isAdminCheck(); // Pastikan admin
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memverifikasi admin.",
    };
  }

  const validatedFields = updateRoleSchema.safeParse({
    group_id: formData.get("group_id"),
    user_id: formData.get("user_id"),
    new_role: formData.get("new_role"),
  });

  if (!validatedFields.success) {
    return { success: false, message: "Input peran tidak valid." };
  }

  const { group_id, user_id, new_role } = validatedFields.data;

  try {
    const supabase = await createClient(); //

    // Jika ingin menjadikan 'leader', pastikan belum ada leader lain
    if (new_role === "leader") {
      const { data: existingLeader, error: leaderCheckError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", group_id)
        .eq("role", "leader")
        .neq("user_id", user_id) // Cek leader lain (bukan diri sendiri)
        .limit(1);

      if (leaderCheckError) throw new Error(leaderCheckError.message);
      if (existingLeader && existingLeader.length > 0) {
        return {
          success: false,
          message:
            "Grup ini sudah memiliki Ketua. Jadikan ketua saat ini sebagai 'member' terlebih dahulu.",
        };
      }
    }

    // Update peran
    const { error: updateError } = await supabase
      .from("group_members")
      .update({ role: new_role })
      .eq("group_id", group_id)
      .eq("user_id", user_id);

    if (updateError) throw new Error(updateError.message);

    revalidatePath(`/groups/${group_id}`);
    return { success: true, message: "Peran anggota berhasil diperbarui." };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return { success: false, message: `Gagal memperbarui peran: ${message}` };
  }
}
