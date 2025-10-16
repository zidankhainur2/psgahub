"use client";

import { useState } from "react";
import type { Task, Course } from "@/types";
import { deleteTask } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/forms/TaskForm";
import { toast } from "sonner";

export default function TasksClient({
  tasks,
  courses,
}: {
  tasks: Task[];
  courses: Course[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      const result = await deleteTask(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Daftar Tugas</h1>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          Tambah Tugas Baru
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Edit Tugas" : "Buat Tugas Baru"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask}
            courses={courses}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {tasks.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col">
              <CardHeader>
                <Badge
                  variant={task.status === "done" ? "default" : "secondary"}
                  className="mb-2 capitalize w-fit"
                >
                  {task.status?.replace("_", " ") ?? "Belum Diatur"}
                </Badge>
                <CardTitle className="line-clamp-2">{task.title}</CardTitle>
                <CardDescription className="pt-1">
                  {task.courses?.name || "Umum"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {task.description || "Tidak ada deskripsi."}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center mt-auto">
                <span className="text-xs text-gray-500">
                  Tenggat:{" "}
                  {new Date(task.due_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700">
            Belum Ada Tugas
          </h3>
          <p className="text-gray-500 mt-2">
            Klik “Tambah Tugas Baru” untuk memulai.
          </p>
        </div>
      )}
    </div>
  );
}
