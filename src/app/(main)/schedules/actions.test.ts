/**
 * @jest-environment node
 */
import { createSchedule, deleteSchedule } from "./actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Mock modules
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("Schedule Server Actions", () => {
  let mockInsert: jest.Mock;
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

    mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    // Mock createClient to return our mocked supabase client
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
        delete: mockDelete,
        select: mockSelect,
      }),
    });
  });

  // Test Case TC010: Admin Membuat Jadwal Baru (Positif)
  test("TC010: should create a schedule successfully", async () => {
    const formData = new FormData();
    formData.append("course_id", "2");
    formData.append("day_of_week", "3");
    formData.append("start_time", "10:00");
    formData.append("end_time", "12:00");
    formData.append("location", "Gedung IT Ruang 301");

    const result = await createSchedule(formData);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        course_id: 2,
        day_of_week: 3,
        start_time: "10:00",
        end_time: "12:00",
        location: "Gedung IT Ruang 301",
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/schedules");
    expect(result).toEqual({
      success: true,
      message: "Jadwal berhasil dibuat.",
    });
  });

  // Test Case TC011: Admin Menghapus Jadwal (Positif)
  test("TC011: should delete a schedule successfully", async () => {
    const scheduleId = 1;
    const result = await deleteSchedule(scheduleId);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", scheduleId);
    expect(revalidatePath).toHaveBeenCalledWith("/schedules");
    expect(result).toEqual({
      success: true,
      message: "Jadwal berhasil dihapus.",
    });
  });

  // Test Case Tambahan: Validasi Format Waktu (Negatif)
  test("should return a validation error for invalid time format", async () => {
    const formData = new FormData();
    formData.append("course_id", "2");
    formData.append("day_of_week", "3");
    formData.append("start_time", "1000"); // Format salah
    formData.append("end_time", "12:00");
    formData.append("location", "Gedung IT Ruang 301");

    const result = await createSchedule(formData);

    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain("Format waktu tidak valid");
  });
});
