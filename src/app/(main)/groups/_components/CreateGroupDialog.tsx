"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; //
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; //
import { PlusCircle } from "lucide-react";
import CreateGroupForm from "@/components/forms/CreateGroupForm";
import type { Course } from "@/types"; //

type CreateGroupDialogProps = {
  courses: Course[];
};

export default function CreateGroupDialog({ courses }: CreateGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Grup Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Grup Baru</DialogTitle>
        </DialogHeader>
        <CreateGroupForm
          courses={courses}
          closeDialog={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
