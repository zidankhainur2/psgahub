/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "@/components/forms/LoginForm";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Mock modules
jest.mock("@/lib/supabase/client");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
}));

describe("LoginForm Component Tests", () => {
  let mockSignInWithPassword: jest.Mock;
  let mockPush: jest.Mock;
  let mockRefresh: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSignInWithPassword = jest.fn();
    mockPush = jest.fn();
    mockRefresh = jest.fn();

    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  // Test Case TC003: Login Pengguna Berhasil (Positif)
  test("TC003: should login successfully with valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "test-user-id", email: "user@example.com" } },
      error: null,
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("anda@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  // Test Case TC004: Login dengan Kredensial Salah (Negatif)
  test("TC004: should show error with invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("anda@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // Test validasi email tidak valid
  test("should show validation error for invalid email", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("anda@email.com");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/alamat email tidak valid/i)).toBeInTheDocument();
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  // Test validasi password minimal 6 karakter
  test("should show validation error for short password", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("anda@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "12345" } });
    fireEvent.blur(passwordInput);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password minimal 6 karakter/i)
      ).toBeInTheDocument();
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});
