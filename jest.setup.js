jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockResolvedValue({ error: null }),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }),
    },
  })),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));