"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createGroup } from "@/app/(main)/groups/actions";
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

// Perbaikan: Gunakan z.number() langsung tanpa coerce
const formSchema = z.object({
  name: z.string().min(3, "Nama grup minimal 3 karakter."),
  course_id: z.number().min(1, "Mata kuliah wajib dipilih."),
});

type GroupFormSchema = z.infer<typeof formSchema>;

type CreateGroupFormProps = {
  courses: Course[];
  closeDialog: () => void;
};

export default function CreateGroupForm({
  courses,
  closeDialog,
}: CreateGroupFormProps) {
  const form = useForm<GroupFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      course_id: 0,
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<GroupFormSchema> = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("course_id", String(values.course_id));

    toast.loading("Membuat grup...");
    const result = await createGroup(formData);
    toast.dismiss();

    if (result.success) {
      toast.success(result.message);
      form.reset();
      closeDialog();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Nama Grup */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Grup</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Kelompok Proyek Grafkom A"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pilih Mata Kuliah */}
        <FormField
          control={form.control}
          name="course_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mata Kuliah Terkait</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value > 0 ? String(field.value) : ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata kuliah" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.name} ({course.lecturer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan..." : "Buat Grup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
