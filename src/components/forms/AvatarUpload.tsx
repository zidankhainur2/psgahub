"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/types";

type AvatarUploadProps = {
  userId: string;
  currentAvatarUrl: string | null;
  onUpload: (newUrl: string) => void;
};

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUpload,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Anda harus memilih gambar untuk diunggah.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error("Gagal mendapatkan URL publik.");
      }

      onUpload(data.publicUrl);
      toast.success("Avatar berhasil diperbarui!");
    } catch (error: any) {
      toast.error(`Gagal mengunggah avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentAvatarUrl || ""} alt="Avatar" />
        <AvatarFallback>{getInitials(userId)}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1.5">
        <Input
          id="picture"
          type="file"
          onChange={uploadAvatar}
          disabled={uploading}
          accept="image/*"
        />
        <p className="text-xs text-muted-foreground">
          PNG, JPG, GIF hingga 1MB.
        </p>
      </div>
    </div>
  );
}
