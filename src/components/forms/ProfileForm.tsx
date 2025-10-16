"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AvatarUpload from "./AvatarUpload";
import type { Profile } from "@/types";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  user: User | null;
  profile: Pick<
    Profile,
    "full_name" | "linkedin_url" | "github_url" | "avatar_url"
  > | null;
};

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  linkedinUrl: z
    .string()
    .url({ message: "URL LinkedIn tidak valid." })
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url({ message: "URL GitHub tidak valid." })
    .optional()
    .or(z.literal("")),
});

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      linkedinUrl: profile?.linkedin_url || "",
      githubUrl: profile?.github_url || "",
    },
  });

  const handleAvatarUpload = async (newUrl: string) => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", user.id);

    if (error) {
      toast.error(`Gagal menyimpan URL avatar: ${error.message}`);
    } else {
      router.refresh();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    const supabase = createClient();
    toast.loading("Memperbarui profil...");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        linkedin_url: values.linkedinUrl,
        github_url: values.githubUrl,
      })
      .eq("id", user.id);

    toast.dismiss();

    if (error) {
      toast.error(`Gagal memperbarui: ${error.message}`);
    } else {
      toast.success("Profil berhasil diperbarui!");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel>Foto Profil</FormLabel>
          <AvatarUpload
            userId={user!.id}
            currentAvatarUrl={profile?.avatar_url || null}
            onUpload={handleAvatarUpload}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" value={user?.email || ""} disabled />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL LinkedIn</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL GitHub</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
