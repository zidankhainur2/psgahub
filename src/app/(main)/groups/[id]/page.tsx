import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Crown, User as UserIcon } from "lucide-react";
import type { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import AddMemberForm from "@/components/forms/AddMemberForm";
import MemberActions from "./_components/MemberActions";

// Helper untuk inisial nama
const getInitials = (name: string | null | undefined) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

type GroupDetailPageProps = {
  params: Promise<{ id: string }>; // Perbaikan: params adalah Promise di Next.js 15
};

// Tipe data yang dikembalikan dari Supabase
type Group = {
  id: number;
  name: string;
  course_id: number | null;
  courses: { name: string } | null;
};

type GroupMember = {
  user_id: string;
  group_id: number;
  role: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  // Perbaikan: Await params
  const resolvedParams = await params;
  const groupId = Number(resolvedParams.id);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [groupRes, membersRes, profileRes, allUsersRes] = await Promise.all([
    supabase
      .from("groups")
      .select("*, courses(name)")
      .eq("id", groupId)
      .single(),
    supabase
      .from("group_members")
      .select("*, profiles(id, full_name, avatar_url)")
      .eq("group_id", groupId)
      .order("role"),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .order("full_name"),
  ]);

  const group: Group | null = groupRes.data;
  const members: GroupMember[] = membersRes.data || [];
  const isAdmin = profileRes.data?.role === "admin";
  const allUsers: Pick<Profile, "id" | "full_name" | "avatar_url">[] =
    allUsersRes.data || [];

  // Jika grup tidak ditemukan atau user tidak punya akses (RLS akan handle ini)
  if (groupRes.error || !group) {
    console.error("Error fetching group:", groupRes.error?.message);
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Grup Tidak Ditemukan</h2>
        <p className="text-muted-foreground">
          Anda mungkin tidak memiliki akses ke grup ini atau grup ini telah
          dihapus.
        </p>
        <Button asChild variant="link">
          <Link href="/groups">Kembali ke Daftar Grup</Link>
        </Button>
      </div>
    );
  }

  // Filter user yang BELUM ada di grup ini
  const memberIds = new Set(members.map((m) => m.profiles?.id).filter(Boolean));
  const availableUsers = allUsers.filter((u) => !memberIds.has(u.id));

  return (
    <div className="space-y-6">
      {/* Tombol Kembali */}
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/groups">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali ke Semua Grup
        </Link>
      </Button>

      {/* Header Grup */}
      <div>
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-lg text-muted-foreground">
          Mata Kuliah: {group.courses?.name || "Umum"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Anggota */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anggota Grup ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={member.profiles?.avatar_url || ""}
                          />
                          <AvatarFallback>
                            {getInitials(member.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.profiles?.full_name || "Nama Tidak Ada"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.role === "leader" ? "Ketua" : "Anggota"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.role === "leader" && (
                          <Badge
                            variant="outline"
                            className="text-yellow-600 border-yellow-600"
                          >
                            <Crown className="mr-1 h-3 w-3" />
                            Ketua
                          </Badge>
                        )}
                        {isAdmin && (
                          <MemberActions
                            member={member}
                            currentUserId={user.id}
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Belum ada anggota di grup ini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Admin (Tambah Anggota) */}
        {isAdmin && (
          <div className="md:col-span-1">
            <AddMemberForm groupId={groupId} availableUsers={availableUsers} />
          </div>
        )}
      </div>
    </div>
  );
}
