# PSGA - Platform Sistem Grup Akademik

Selamat datang di dokumentasi proyek PSGA! Dokumen ini bertujuan untuk memberikan semua informasi yang dibutuhkan oleh pengembang untuk memahami, menjalankan, dan berkontribusi pada proyek ini.

## ራ Visi Proyek

PSGA adalah platform web internal yang dirancang untuk mahasiswa Informatika semester 7. Tujuannya adalah untuk menyediakan satu tempat terpusat untuk manajemen akademik, kolaborasi tugas kelompok, dan interaksi sosial, dibangun dengan tumpukan teknologi modern yang cepat dan efisien.

## ⚙️ Tumpukan Teknologi (Tech Stack)

| Layer               | Teknologi                                      |
| ------------------- | ---------------------------------------------- |
| **Framework**       | Next.js 14+ (App Router)                       |
| **Bahasa**          | TypeScript                                     |
| **Backend & DB**    | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Styling**         | Tailwind CSS                                   |
| **Komponen UI**     | Shadcn/ui                                      |
| **Manajemen Form**  | React Hook Form + Zod                          |
| **Package Manager** | pnpm                                           |

## 🚀 Panduan Setup Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di mesin lokal Anda.

### 1. Prasyarat

- Node.js (v18 atau lebih baru)
- `pnpm` terinstal secara global (`npm install -g pnpm`)
- Akun [Supabase](https://supabase.com)
- Git

### 2. Setup Proyek Supabase

1.  **Buat Proyek Baru**: Di dashboard Supabase, buat proyek baru.
2.  **Jalankan Skema SQL**: Buka `SQL Editor`, salin seluruh skema SQL yang ada di dalam proyek ini, dan jalankan untuk membuat semua tabel dan RLS (Row Level Security).
3.  **Dapatkan Kunci API**: Buka `Project Settings > API`. Salin **Project URL** dan **anon public key**.

### 3. Setup Lokal

1.  **Clone Repository**:

    ```bash
    git clone [URL_REPOSITORY_GITHUB_ANDA]
    cd psga
    ```

2.  **Install Dependensi**:

    ```bash
    pnpm install
    ```

3.  **Konfigurasi Environment**:

    - Buat file baru bernama `.env.local` di root proyek.
    - Salin konten dari `.env.example` (jika ada) atau gunakan template di bawah.
    - Isi dengan kunci API dari Supabase Anda.

    ```sh
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_PROYEK_SUPABASE_ANDA
    ```

    > **PENTING**: File `.env.local` tidak boleh pernah di-commit ke Git!

4.  **Jalankan Aplikasi**:
    ```bash
    pnpm dev
    ```
    Aplikasi sekarang berjalan di [http://localhost:3000](http://localhost:3000).

## 📂 Struktur Proyek

Proyek ini menggunakan App Router dari Next.js. Berikut adalah gambaran struktur folder dan tujuannya:

- `psga/`
  - `app/`: Direktori utama untuk semua rute dan halaman.
    - `(auth)/`: Grup rute untuk autentikasi (login, register). Tidak muncul di URL.
    - `(main)/`: Grup rute untuk halaman yang memerlukan login. Dilindungi oleh `layout.tsx` di dalamnya.
    - `actions.ts`: File yang berisi Server Actions (misalnya, `createTask`).
    - `layout.tsx`: Layout utama untuk seluruh aplikasi.
    - `page.tsx`: Komponen halaman untuk sebuah rute.
  - `components/`: Komponen React yang dapat digunakan kembali.
    - `ui/`: Komponen "primitif" yang di-generate oleh Shadcn/ui (Button, Card, dll).
    - `forms/`: Komponen form spesifik (LoginForm, TaskForm).
    - `shared/`: Komponen yang digunakan di banyak tempat (MainNav, Footer).
  - `lib/`: Utilitas dan konfigurasi.
    - `supabase/`: Konfigurasi klien Supabase untuk server dan client.
    - `utils.ts`: Fungsi helper umum (misalnya, dari Shadcn).
  - `types/`: Definisi tipe TypeScript global.

## 🏛️ Konsep Arsitektur

- **Server Components by Default**: Sebagian besar komponen adalah Server Components. Mereka mengambil data langsung di server untuk performa yang lebih baik.
- **Client Components untuk Interaktivitas**: Komponen yang memerlukan state atau event handler (seperti form) ditandai dengan `"use client";`.
- **Server Actions untuk Mutasi Data**: Semua operasi CUD (Create, Update, Delete) ditangani oleh Server Actions. Ini lebih aman karena kode berjalan di server dan tidak mengekspos endpoint API. Fungsi `revalidatePath` digunakan untuk me-refresh data di UI setelah mutasi berhasil.
- **Autentikasi**: Dikelola sepenuhnya oleh Supabase Auth. Layout di `app/(main)/layout.tsx` bertindak sebagai _middleware_ yang melindungi semua rute di dalamnya.

## 🛣️ Roadmap & Kontribusi

Berikut adalah fitur selanjutnya yang akan dikembangkan:

- [ ] Fase 2: Fitur Akademik Lanjutan (CRUD Jadwal)
- [ ] Fase 3: Kolaborasi (Manajemen Grup, Penyimpanan File, Kas)
- [ ] Fase 4: Fitur Lanjutan (Editor Dokumen Real-time, Galeri)

Lihat bagian **Panduan Kontribusi** di GitHub untuk detail tentang cara berkontribusi.
