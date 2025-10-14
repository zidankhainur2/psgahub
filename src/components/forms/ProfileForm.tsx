"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

type ProfileFormProps = {
  user: User | null;
  profile: {
    full_name: string | null;
    linkedin_url: string | null;
    github_url: string | null;
  } | null;
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
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      linkedinUrl: profile?.linkedin_url || "",
      githubUrl: profile?.github_url || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setMessage(null);
    const supabase = createClient();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        linkedin_url: values.linkedinUrl,
        github_url: values.githubUrl,
      })
      .eq("id", user.id); 

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Profil berhasil diperbarui!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email || ""} disabled />
        </div>

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

        {message && (
          <p className="text-sm font-medium text-gray-800">{message}</p>
        )}

        <Button type="submit">Simpan Perubahan</Button>
      </form>
    </Form>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}
