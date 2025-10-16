// app/(main)/schedules/SchedulesClient.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteSchedule } from "./actions";
import ScheduleForm from "@/components/forms/ScheduleForm";
import type { Schedule, Course } from "@/types";

const daysOfWeek: { [key: number]: string } = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

export default function SchedulesClient({
  schedules,
  courses,
  role,
}: {
  schedules: Schedule[];
  courses: Course[];
  role: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as { [key: number]: Schedule[] });

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      await deleteSchedule(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Jadwal Kuliah</h1>
        {role === "admin" && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsDialogOpen(true)}
          >
            Tambah Jadwal
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Jadwal Baru</DialogTitle>
          </DialogHeader>
          <ScheduleForm
            courses={courses}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        {Object.keys(groupedSchedules).length > 0 ? (
          Object.entries(groupedSchedules).map(([day, daySchedules]) => (
            <div key={day}>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 border-b pb-2">
                {daysOfWeek[parseInt(day)]}
              </h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {daySchedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardHeader>
                      <CardTitle>{schedule.courses?.name || "N/A"}</CardTitle>
                      <CardDescription>
                        {schedule.courses?.lecturer || "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p>
                        <strong>Waktu:</strong>{" "}
                        {schedule.start_time.slice(0, 5)} -{" "}
                        {schedule.end_time.slice(0, 5)}
                      </p>
                      <p>
                        <strong>Lokasi:</strong> {schedule.location}
                      </p>
                    </CardContent>
                    <CardFooter>
                      {role === "admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          Hapus
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Jadwal Masih Kosong</h3>
            <p className="text-gray-500 mt-2">
              Klik "Tambah Jadwal" untuk mengisi jadwal kuliah.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
