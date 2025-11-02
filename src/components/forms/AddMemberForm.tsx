"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"; //
import { addMemberToGroup } from "@/app/(main)/groups/actions";
import { Button } from "@/components/ui/button"; //
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; //
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; //
import type { Profile } from "@/types"; //

// Tipe sederhana untuk user yang bisa ditambahkan
type AvailableUser = Pick<Profile, "id" | "full_name" | "avatar_url">;

// Skema validasi form
const formSchema = z.object({
  user_id: z.string().uuid("Anda harus memilih pengguna."),
  role: z.enum(["member", "leader"], { message: "Peran wajib dipilih." }),
});

type AddMemberSchema = z.infer<typeof formSchema>;

type AddMemberFormProps = {
  groupId: number;
  availableUsers: AvailableUser[];
};

export default function AddMemberForm({
  groupId,
  availableUsers,
}: AddMemberFormProps) {
  const form = useForm<AddMemberSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: undefined,
      role: "member",
    },
  });

  const onSubmit: SubmitHandler<AddMemberSchema> = async (values) => {
    const formData = new FormData();
    formData.append("group_id", String(groupId));
    formData.append("user_id", values.user_id);
    formData.append("role", values.role);

    toast.loading("Menambahkan anggota...");
    const result = await addMemberToGroup(formData);
    toast.dismiss();

    if (result.success) {
      toast.success(result.message);
      form.reset(); // Reset form
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border bg-card p-4 shadow-sm"
      >
        <h4 className="font-semibold text-card-foreground">
          Tambah Anggota Baru
        </h4>
        {availableUsers.length > 0 ? (
          <>
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengguna</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pengguna..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || "Tanpa Nama"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Anggota</SelectItem>
                      <SelectItem value="leader">Ketua</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Menambahkan..."
                : "Tambah ke Grup"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Semua pengguna sudah ada di dalam grup ini.
          </p>
        )}
      </form>
    </Form>
  );
}
