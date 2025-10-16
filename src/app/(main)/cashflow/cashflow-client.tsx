"use client";

import { useActionState, useEffect, useState } from "react";
import { CashFlow, Profile } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrUpdateTransaction, deleteTransaction } from "./actions";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

type FormState =
  | {
      data: string;
      error?: undefined;
    }
  | {
      data?: undefined;
      error: {
        _server?: string[];
        description?: string[];
        amount?: string[];
        type?: string[];
        transaction_date?: string[];
        member_id?: string[];
        id?: string[];
      };
    };

const initialState: FormState = {
  error: {},
};

type Member = Pick<Profile, "id" | "full_name">;
type Props = {
  initialTransactions: CashFlow[];
  members: Member[];
  isAdmin: boolean;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Menyimpan..."
        : isEditing
        ? "Simpan Perubahan"
        : "Tambah Transaksi"}
    </Button>
  );
}

export default function CashflowClient({
  initialTransactions,
  members,
  isAdmin,
}: Props) {
  const [transactions, setTransactions] =
    useState<CashFlow[]>(initialTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashFlow | null>(
    null
  );

  const [formState, formAction] = useActionState(
    createOrUpdateTransaction,
    initialState
  );

  useEffect(() => {
    if (formState?.data && isDialogOpen) {
      toast.success(formState.data);
      setIsDialogOpen(false);
      setEditingTransaction(null);
    } else if (formState?.error && isDialogOpen) {
      toast.error("Gagal menyimpan. Periksa kembali isian Anda.");
    }
  }, [formState, isDialogOpen]);

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transaksi berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus transaksi.");
    }
  };

  const handleEditClick = (transaction: CashFlow) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isAdmin && (
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Transaksi
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              {isAdmin && <TableHead className="text-center">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  {t.transaction_date
                    ? new Date(t.transaction_date).toLocaleDateString("id-ID")
                    : "N/A"}
                </TableCell>
                <TableCell className="font-medium">{t.description}</TableCell>
                <TableCell>{t.profiles?.[0]?.full_name || "N/A"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      t.type === "income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(t.amount)}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Apakah Anda yakin?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan
                              menghapus transaksi secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(t.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            {editingTransaction && (
              <input type="hidden" name="id" value={editingTransaction.id} />
            )}
            <div>
              <Label htmlFor="description">Keterangan</Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingTransaction?.description || ""}
              />
            </div>
            <div>
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                defaultValue={editingTransaction?.amount || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipe</Label>
                <Select
                  name="type"
                  defaultValue={editingTransaction?.type || "income"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transaction_date">Tanggal</Label>
                <Input
                  id="transaction_date"
                  name="transaction_date"
                  type="date"
                  defaultValue={
                    editingTransaction?.transaction_date ||
                    new Date().toISOString().split("T")[0]
                  }
                />
              </div>
            </div>
            <div>
              <Label>Member</Label>
              <Select
                name="member_id"
                defaultValue={editingTransaction?.member_id?.toString() || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
              <SubmitButton isEditing={!!editingTransaction} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
