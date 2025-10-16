/**
 * @jest-environment-node
 */
import { createOrUpdateTransaction, deleteTransaction } from "./actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }));

describe("Cash Flow Server Actions", () => {
  const initialState = { error: undefined, data: undefined };
  let mockInsert: jest.Mock,
    mockUpdate: jest.Mock,
    mockDelete: jest.Mock,
    mockEq: jest.Mock,
    mockFrom: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEq = jest.fn().mockResolvedValue({ error: null });
    mockUpdate = jest.fn(() => ({ eq: mockEq }));
    mockDelete = jest.fn(() => ({ eq: mockEq }));
    mockInsert = jest.fn().mockResolvedValue({ error: null });

    mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: { role: "admin" }, error: null }),
        };
      }
      return { insert: mockInsert, update: mockUpdate, delete: mockDelete };
    });

    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
      },
    });
  });

  test("TC013: should call insert when no ID is provided", async () => {
    const formData = new FormData();
    formData.append("description", "Iuran Kas November");
    formData.append("amount", "50000");
    formData.append("type", "income");
    formData.append("transaction_date", "2025-11-10");
    formData.append("member_id", "a1b2c3d4-e5f6-7890-1234-567890abcdef");

    await createOrUpdateTransaction(initialState, formData);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/cashflow");
  });

  test("TC014: should call update when an ID is provided", async () => {
    const formData = new FormData();
    formData.append("id", "123");
    formData.append("description", "Pembelian ATK");
    formData.append("amount", "35000");
    formData.append("type", "expense");
    formData.append("transaction_date", "2025-11-11");
    formData.append("member_id", "a1b2c3d4-e5f6-7890-1234-567890abcdef");

    await createOrUpdateTransaction(initialState, formData);

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "123");
    expect(mockInsert).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/cashflow");
  });

  test("TC016: should return an error for non-admin user", async () => {
    // Override mock untuk test case ini: user BUKAN admin
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: { role: "user" }, error: null }),
        };
      }
      return { insert: mockInsert, update: mockUpdate };
    });

    const formData = new FormData(); // Data tidak penting
    const result = await createOrUpdateTransaction(initialState, formData);

    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.error?._server).toContain("Unauthorized: Admins only");
  });
});
