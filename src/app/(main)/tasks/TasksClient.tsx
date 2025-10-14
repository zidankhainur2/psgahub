"use client";

import { useState } from "react";
import type { Task, Course } from "./page";
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
      await deleteTask(id);
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Tugas</h1>
        <Button onClick={handleAddNew}>Tambah Tugas Baru</Button>
      </div>

      {/* Dialog Tambah/Edit */}
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
            closeDialog={() => {
              setIsDialogOpen(false);
              window.location.reload();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Daftar Tugas */}
      {tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge
                      variant={task.status === "done" ? "default" : "secondary"}
                      className="mb-2 capitalize"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription className="pt-1">
                      {task.courses?.name || "Umum"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600">
                  {task.description || "-"}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
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
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Belum Ada Tugas</h3>
          <p className="text-gray-500 mt-2">
            Klik “Tambah Tugas Baru” untuk memulai.
          </p>
        </div>
      )}
    </div>
  );
}
