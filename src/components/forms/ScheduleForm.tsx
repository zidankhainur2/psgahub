"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Course } from "@/types";

const scheduleSchema = z.object({
  course_id: z.number().min(1, "Mata kuliah wajib dipilih."),
  day_of_week: z.number().min(1, "Hari wajib dipilih.").max(7),
  start_time: z
    .string()
    .min(1, "Waktu mulai wajib diisi.")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid (HH:MM)."),
  end_time: z
    .string()
    .min(1, "Waktu selesai wajib diisi.")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid (HH:MM)."),
  location: z.string().min(2, "Lokasi minimal 2 karakter."),
});

type ScheduleSchema = z.infer<typeof scheduleSchema>;

type ScheduleFormProps = {
  courses: Course[];
  closeDialog: () => void;
};

export default function ScheduleForm({
  courses,
  closeDialog,
}: ScheduleFormProps) {
  const form = useForm<ScheduleSchema>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      location: "",
      start_time: "",
      end_time: "",
      course_id: 0,
      day_of_week: 0,
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<ScheduleSchema> = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    toast.loading("Menyimpan jadwal...");
    const result = await createSchedule(formData);
    toast.dismiss();

    if (result.success) {
      toast.success(result.message);
      closeDialog();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        {/* Pilih Mata Kuliah */}
        <Controller
          control={form.control}
          name="course_id"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Mata Kuliah</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value > 0 ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata kuliah" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-sm font-medium text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Pilih Hari */}
        <Controller
          control={form.control}
          name="day_of_week"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Hari</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value > 0 ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Senin</SelectItem>
                  <SelectItem value="2">Selasa</SelectItem>
                  <SelectItem value="3">Rabu</SelectItem>
                  <SelectItem value="4">Kamis</SelectItem>
                  <SelectItem value="5">Jumat</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-sm font-medium text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Waktu Mulai & Selesai */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="start_time"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Waktu Mulai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          <Controller
            control={form.control}
            name="end_time"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Waktu Selesai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Lokasi */}
        <Controller
          control={form.control}
          name="location"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Lokasi (Ruangan)</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Lab 1 / Ruang 304" {...field} />
              </FormControl>
              {fieldState.error && (
                <p className="text-sm font-medium text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
