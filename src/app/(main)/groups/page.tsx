// src/app/(main)/groups/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import type { Course } from "@/types";
import CreateGroupDialog from "./_components/CreateGroupDialog";

// Definisikan tipe data yang diharapkan dari Supabase query
type UserGroupData = {
  role: string;
  groups: {
    id: number;
    name: string;
    course_id: number | null;
    courses: { name: string } | null; // Perbaikan: courses adalah objek tunggal, bukan array
  } | null;
};

export default async function GroupsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Ambil data grup dan mata kuliah secara bersamaan
  const [userGroupsRes, coursesRes, profileRes] = await Promise.all([
    supabase
      .from("group_members")
      .select(
        `
        role,
        groups (
          id,
          name,
          course_id,
          courses ( name )
        )
      `
      )
      .eq("user_id", user.id),
    supabase.from("courses").select("id, name, lecturer").order("name"),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  const { data: userGroupsData, error: groupsError } = userGroupsRes;
  const { data: courses, error: coursesError } = coursesRes;
  const profile = profileRes.data;

  // Casting data grup ke tipe yang kita definisikan
  const userGroups = userGroupsData as UserGroupData[] | null;

  if (groupsError || coursesError) {
    console.error("Error fetching data:", groupsError || coursesError);
    return (
      <p className="text-red-500">Gagal memuat data grup atau mata kuliah.</p>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Grup Saya</h1>
        {isAdmin && <CreateGroupDialog courses={(courses as Course[]) || []} />}
      </div>

      {userGroups && userGroups.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {userGroups.map(({ groups: group, role }) => {
            // Cek jika group (yang bisa jadi null dari join) ada
            if (!group) return null;

            // Perbaikan: courses adalah objek tunggal, bukan array
            const courseName = group.courses?.name || "Grup Umum";

            return (
              <Link
                href={`/groups/${group.id}`}
                key={group.id}
                className="block"
              >
                <Card className="hover:shadow-md hover:border-primary/50 transition-all h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="line-clamp-1">{group.name}</span>
                      {role === "leader" && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Ketua
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{courseName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Peran Anda: {role === "leader" ? "Ketua" : "Anggota"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">
            Anda Belum Bergabung Grup Apapun
          </h3>
          <p className="text-gray-500 mt-2 max-w-xs">
            Admin akan menambahkan Anda ke grup yang relevan.
          </p>
        </div>
      )}
    </div>
  );
}
