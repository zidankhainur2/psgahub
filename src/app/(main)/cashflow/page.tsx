import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CashflowClient from "./cashflow-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fungsi helper untuk format mata uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function CashflowPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Ambil profil user saat ini untuk cek peran (role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Ambil semua data cash flow dan join dengan tabel profiles untuk mendapatkan nama
  const { data: transactions, error } = await supabase
    .from("cash_flow")
    .select(
      `
      id,
      description,
      amount,
      type,
      transaction_date,
      member_id,
      profiles (full_name)
    `
    )
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching cash flow:", error);
    // Tampilkan pesan error atau halaman error
  }
  
  // Ambil semua member untuk dropdown di form (hanya diperlukan oleh admin)
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");

  // Hitung total pemasukan, pengeluaran, dan saldo
  let totalIncome = 0;
  let totalExpense = 0;
  transactions?.forEach((t) => {
    if (t.type === "income") {
      totalIncome += Number(t.amount);
    } else {
      totalExpense += Number(t.amount);
    }
  });
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Uang Kas</h1>
      
      {/* Kartu Rangkuman */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Komponen Client untuk Tabel dan Aksi */}
      <CashflowClient
        initialTransactions={transactions || []}
        members={members || []}
        isAdmin={isAdmin}
      />
    </div>
  );
}