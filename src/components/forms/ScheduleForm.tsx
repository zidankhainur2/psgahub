"use client";

import { useState } from "react";
import { createSchedule } from "@/app/(main)/schedules/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Course = {
  id: number;
  name: string;
};

type ScheduleFormProps = {
  courses: Course[];
  closeDialog: () => void;
};

export default function ScheduleForm({
  courses,
  closeDialog,
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true);
        const result = await createSchedule(formData);
        setIsSubmitting(false);

        if (!result?.error) {
          closeDialog();
        } else {
          console.error(result.error);
          alert("Gagal menyimpan jadwal!");
        }
      }}
      className="space-y-4"
    >
      {/* Mata Kuliah */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Mata Kuliah</label>
        <Select name="course_id" required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih mata kuliah" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hari */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Hari</label>
        <Select name="day_of_week" required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih hari" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Senin</SelectItem>
            <SelectItem value="2">Selasa</SelectItem>
            <SelectItem value="3">Rabu</SelectItem>
            <SelectItem value="4">Kamis</SelectItem>
            <SelectItem value="5">Jumat</SelectItem>
            <SelectItem value="6">Sabtu</SelectItem>
            <SelectItem value="7">Minggu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jam Mulai */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Jam Mulai</label>
        <Input type="time" name="start_time" required />
      </div>

      {/* Jam Selesai */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Jam Selesai</label>
        <Input type="time" name="end_time" required />
      </div>

      {/* Lokasi */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Lokasi</label>
        <Input name="location" placeholder="Masukkan lokasi kelas" required />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
