"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transactionSchema = z.object({
  id: z.coerce.number().optional(),
  description: z.string().min(3, "Deskripsi minimal 3 karakter"),
  amount: z.coerce.number().positive("Jumlah harus angka positif"),
  type: z.enum(["income", "expense"]),
 transaction_date: z.coerce.date({ invalid_type_error: "Format tanggal tidak valid" }),

  member_id: z.string().uuid("Member tidak valid"),
});

async function isAdminCheck() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') {
    throw new Error("Unauthorized: Admins only");
  }
}

// ================= PERBAIKAN PENTING DI SINI =================
// Fungsi ini sekarang menerima 'prevState' sebagai argumen pertama
export async function createOrUpdateTransaction(prevState: any, formData: FormData) {
// =============================================================
  try {
    await isAdminCheck();
  } catch (error) {
    return { error: { _server: [(error as Error).message] } };
  }

  const validatedFields = transactionSchema.safeParse({
    id: formData.get("id") ? formData.get("id") : undefined,
    description: formData.get("description"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    transaction_date: formData.get("transaction_date"),
    member_id: formData.get("member_id"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  const { id, ...transactionData } = validatedFields.data;
  const supabase = createClient();

  let error;
  if (id) {
    ({ error } = await supabase.from("cash_flow").update(transactionData).eq("id", id));
  } else {
    ({ error } = await supabase.from("cash_flow").insert(transactionData));
  }
  
  if (error) return { error: { _server: [error.message] } };
  
  revalidatePath("/cashflow");
  return { data: "Transaksi berhasil disimpan." };
}

export async function deleteTransaction(id: number) {
  await isAdminCheck();

  const supabase = createClient();
  const { error } = await supabase.from("cash_flow").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/cashflow");
}