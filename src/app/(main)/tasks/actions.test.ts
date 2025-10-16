/**
 * @jest-environment node
 */
import { createTask, updateTask, deleteTask } from "./actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Mock modules
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("Task Server Actions", () => {
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock return values
    mockSelect = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    mockEq = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    mockInsert = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    // Mock createClient to return our mocked supabase client
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        select: mockSelect,
      }),
    });
  });

  // Test Case TC006: Membuat Tugas Baru (Positif)
  test("TC006: should create a task successfully with valid data", async () => {
    const formData = new FormData();
    formData.append("title", "Selesaikan Laporan Kualitas Perangkat Lunak");
    formData.append("due_date", "2025-10-20");
    formData.append("status", "in_progress");
    formData.append("course_id", "1");

    const result = await createTask(formData);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Selesaikan Laporan Kualitas Perangkat Lunak",
        due_date: "2025-10-20",
        status: "in_progress",
        course_id: 1,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(result).toEqual({
      success: true,
      message: "Tugas berhasil dibuat.",
    });
  });

  // Test Case TC007: Mengedit Tugas (Positif)
  test("TC007: should update a task successfully", async () => {
    const taskId = 1;
    const formData = new FormData();
    formData.append("title", "Judul Tugas yang Sudah Diperbarui");
    formData.append("status", "done");
    formData.append("due_date", "2025-10-21");
    formData.append("course_id", "1");

    const result = await updateTask(taskId, formData);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Judul Tugas yang Sudah Diperbarui",
        status: "done",
        due_date: "2025-10-21",
        course_id: 1,
      })
    );
    expect(mockEq).toHaveBeenCalledWith("id", taskId);
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(result).toEqual({
      success: true,
      message: "Tugas berhasil diperbarui.",
    });
  });

  // Test Case TC008: Menghapus Tugas (Positif)
  test("TC008: should delete a task successfully", async () => {
    const taskId = 1;
    const result = await deleteTask(taskId);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", taskId);
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(result).toEqual({
      success: true,
      message: "Tugas berhasil dihapus.",
    });
  });

  // Test Case TC009: Validasi Judul Tugas (Negatif)
  test("TC009: should fail to create a task with a short title", async () => {
    const formData = new FormData();
    formData.append("title", "AB"); // Judul tidak valid
    formData.append("due_date", "2025-10-20");
    formData.append("status", "todo");
    formData.append("course_id", "1");

    const result = await createTask(formData);

    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain("minimal 3 karakter");
  });
});
