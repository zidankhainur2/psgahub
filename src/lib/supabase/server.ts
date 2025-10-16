import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          try {
            return (await cookieStore).get(name)?.value;
          } catch {
            return undefined;
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            // hanya izinkan set cookies jika konteksnya Server Action
            if (typeof (await cookieStore).set === "function") {
              (await cookieStore).set({ name, value, ...options });
            } else {
              console.warn(
                `[Supabase] Skip set cookie (${name}) - not in Server Action context`
              );
            }
          } catch (error) {
            console.warn(
              `[Supabase] Failed to set cookie (${name}):`,
              (error as Error).message
            );
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            if (typeof (await cookieStore).set === "function") {
              (await cookieStore).set({ name, value: "", ...options });
            } else {
              console.warn(
                `[Supabase] Skip remove cookie (${name}) - not in Server Action context`
              );
            }
          } catch (error) {
            console.warn(
              `[Supabase] Failed to remove cookie (${name}):`,
              (error as Error).message
            );
          }
        },
      },
    }
  );
}
