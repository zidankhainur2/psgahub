// src/app/(main)/groups/[id]/_components/MemberActions.tsx
"use client";

import { useState, useTransition } from "react";
import type { GroupMember } from "@/types"; //
import {
  removeMemberFromGroup,
  updateMemberRole,
} from "@/app/(main)/groups/actions";
import { toast } from "sonner"; //
import { Button } from "@/components/ui/button"; //
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; //
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; //
import {
  MoreHorizontal,
  ShieldAlert,
  Trash,
  UserCheck,
  UserX,
} from "lucide-react";

type MemberActionsProps = {
  // Kita perlu tipe GroupMember yang sudah di-join dengan profiles
  member: {
    user_id: string;
    group_id: number;
    role: string;
    profiles: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
  currentUserId: string;
};

export default function MemberActions({
  member,
  currentUserId,
}: MemberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isRemoveAlertOpen, setIsRemoveAlertOpen] = useState(false);

  // Admin tidak bisa melakukan aksi pada dirinya sendiri
  if (member.user_id === currentUserId) {
    return null;
  }

  const handleChangeRole = (newRole: "member" | "leader") => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("group_id", String(member.group_id));
      formData.append("user_id", member.user_id);
      formData.append("new_role", newRole);

      toast.loading("Memperbarui peran...");
      const result = await updateMemberRole(formData);
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemoveMember = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("group_id", String(member.group_id));
      formData.append("user_id", member.user_id);

      toast.loading("Mengeluarkan anggota...");
      const result = await removeMemberFromGroup(formData);
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
        setIsRemoveAlertOpen(false); // Tutup dialog jika berhasil
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleChangeRole("leader")}
            disabled={member.role === "leader" || isPending}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Jadikan Ketua
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleChangeRole("member")}
            disabled={member.role === "member" || isPending}
          >
            <UserX className="mr-2 h-4 w-4" />
            Jadikan Anggota
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsRemoveAlertOpen(true)}
            disabled={isPending}
          >
            <Trash className="mr-2 h-4 w-4" />
            Keluarkan dari Grup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isRemoveAlertOpen} onOpenChange={setIsRemoveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <ShieldAlert className="h-6 w-6 text-destructive inline-block mr-2" />
              Anda yakin?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mengeluarkan{" "}
              <strong>{member.profiles?.full_name || "anggota ini"}</strong>{" "}
              dari grup. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isPending}
            >
              {isPending ? "Mengeluarkan..." : "Ya, Keluarkan"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
