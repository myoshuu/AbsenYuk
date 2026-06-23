# Package Updates & Prisma 7 Connection Pooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all packages to latest versions and configure Prisma 7's built-in connection pooling to resolve Vercel's "max connections" error.

**Architecture:** Update npm packages to latest versions, refactor Prisma client initialization to use Prisma 7's native connection pool (PgBouncer-style pooling built into the client), and update any code affected by breaking changes in Zod v4 and other packages.

**Tech Stack:** Node.js, Next.js 16, Prisma 7, PostgreSQL, Zod 4, NextAuth 5

## Global Constraints

- Node.js: 18+ required for Prisma 7
- Database: PostgreSQL (Neon/Supabase/Aiven compatible)
- Framework: Next.js 16 (already using App Router)
- Package manager: npm

---

## File Structure

```
package.json                           # Update all dependency versions
prisma/schema.prisma                   # Update for Prisma 7 connection string format
src/lib/prisma.ts                      # Refactor for Prisma 7 pooling
src/lib/validations.ts                 # Update Zod schemas for v4
src/app/api/auth/forgot-password/route.ts  # Check bcrypt usage
src/app/api/auth/reset-password/route.ts   # Check bcrypt usage
src/app/api/user/password/route.ts      # Check bcrypt usage
src/app/api/admin/users/route.ts       # Check bcrypt usage
src/app/api/admin/users/[id]/route.ts  # Check bcrypt usage
src/app/api/register/route.ts          # Check bcrypt usage
.env.example                           # Document new DATABASE_URL format
```

---

## Task 1: Install Dependencies & Run Prisma 7 Migration

**Files:**
- Modify: `package.json:23-46`
- Modify: `prisma/schema.prisma:1-8`
- Create: `prisma/migrations/`

**Interfaces:**
- Consumes: Existing `package.json` dependencies
- Produces: Updated `package-lock.json`, regenerated Prisma client

- [ ] **Step 1: Update package.json with new versions**

Update `package.json` dependencies section to:

```json
"dependencies": {
  "@prisma/client": "^7.8.0",
  "@tailwindcss/postcss": "^4.3.1",
  "bcryptjs": "^3.0.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "dotenv": "^17.4.2",
  "exceljs": "^4.4.0",
  "framer-motion": "^12.0.0",
  "lucide-react": "^1.21.0",
  "multer": "^2.2.0",
  "next": "^16.2.9",
  "next-auth": "^5.0.0-beta.31",
  "pdfmake": "^0.3.11",
  "prisma": "^7.8.0",
  "qrcode": "^1.5.4",
  "radix-ui": "^1.6.0",
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "recharts": "^3.8.1",
  "sonner": "^2.0.7",
  "tailwind-merge": "^3.6.0",
  "uuid": "^14.0.1",
  "zod": "^4.4.3"
}
```

- [ ] **Step 2: Update prisma/schema.prisma generator**

Modify `prisma/schema.prisma` lines 1-3:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

- [ ] **Step 3: Update prisma/schema.prisma datasource**

Modify `prisma/schema.prisma` lines 5-8:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Note: Prisma 7 automatically handles connection pooling. The URL format stays the same, but pooling happens at the client level.

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: All packages install without errors

- [ ] **Step 5: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: Success message with "Generated Prisma Client"

- [ ] **Step 6: Run database migration check**

Run: `npx prisma migrate status`
Expected: Shows current migration state

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json prisma/schema.prisma
git commit -m "chore: update to Prisma 7.8.0 and latest dependencies"
```

---

## Task 2: Refactor Prisma Client for Connection Pooling

**Files:**
- Modify: `src/lib/prisma.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `@prisma/client` v7
- Produces: Updated `prisma` singleton with connection pool configuration

- [ ] **Step 1: Read current prisma.ts implementation**

Review `src/lib/prisma.ts` to understand current setup.

- [ ] **Step 2: Update src/lib/prisma.ts for Prisma 7 pooling**

Replace the entire file content with:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

Prisma 7 uses built-in connection pooling that automatically manages connections. No additional PgBouncer configuration needed.

- [ ] **Step 3: Update .env.example documentation**

Modify `.env.example` to add connection pooling notes:

```bash
# ===================
# Database (PostgreSQL)
# ===================
# Local PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Cloud PostgreSQL with Prisma 7 pooling (Neon/Supabase/Aiven)
# DATABASE_URL="postgres://user:password@host:port/database?sslmode=require&pool_timeout=10"

# Prisma 7 handles connection pooling automatically.
# For serverless: set connection_limit=1 in URL for fine-grained control
# Example: DATABASE_URL="postgres://...@host:5432/db?connection_limit=1&pool_timeout=10"
```

- [ ] **Step 4: Test prisma connection**

Run: `npx prisma db execute --stdin` (or test via a simple query in a route)

- [ ] **Step 5: Commit**

```bash
git add src/lib/prisma.ts .env.example
git commit -m "feat: refactor prisma client for Prisma 7 built-in pooling"
```

---

## Task 3: Update Zod v3 to v4 Schemas

**Files:**
- Modify: `src/lib/validations.ts`
- Check: All files importing from validations.ts

**Interfaces:**
- Consumes: `zod` v4
- Produces: Updated validation schemas

**Zod v4 Breaking Changes:**
- `.regex()` is deprecated → use `.matches()` instead
- `.url()` is deprecated → use `.uri()` instead
- Error messages use `.error()` not `.issues`
- Some method renames

- [ ] **Step 1: Read current validations.ts**

Review `src/lib/validations.ts` to identify Zod v3 syntax.

- [ ] **Step 2: Update validations.ts for Zod v4**

Replace `src/lib/validations.ts` content with:

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  role: z.enum(["user", "organizer"]).default("user"),
});

export const registerSimpleSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(30, "Username maksimal 30 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const acaraSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter").max(150),
  deskripsi: z.string().optional(),
  lokasi: z.string().min(3, "Lokasi minimal 3 karakter").optional(),
  tanggal_mulai: z.string().transform((v) => new Date(v)),
  tanggal_akhir: z.string().transform((v) => new Date(v)),
  maks_peserta: z.number().int().min(0).default(0),
});

export const createAcaraSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi").max(150, "Judul maksimal 150 karakter"),
  deskripsi: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  lokasi: z.string().max(255).optional(),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggal_akhir: z.string().min(1, "Tanggal akhir wajib diisi"),
  status: z.enum(["akan_datang", "berlangsung", "selesai", "dibatalkan"]).optional(),
  maks_peserta: z.number().min(0).default(0),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, underscore")
    .optional(),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export const absensiSchema = z.object({
  judul: z.string().min(2, "Judul minimal 2 karakter").max(100),
  lokasi: z.string().optional(),
});

export const createAbsensiSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi").max(100),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong").max(1000, "Pesan maksimal 1000 karakter"),
});

export const exportSchema = z.object({
  type: z.enum(["acara", "absensi", "users"]),
  format: z.enum(["xlsx", "pdf"]),
  acara_id: z.number().optional(),
});
```

Note: The schemas use `.regex()` which still works in Zod v4 (it's an alias). If you see warnings, update to `.matches()`.

- [ ] **Step 3: Check bcryptjs compatibility**

Verify bcryptjs 3.x is compatible. If issues arise, the API should remain the same.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations.ts
git commit -m "chore: update Zod schemas for v4 compatibility"
```

---

## Task 4: Verify All Routes Work

**Files:**
- Test: All API routes using prisma

**Interfaces:**
- Consumes: Updated prisma client, validations
- Produces: Confirmed working routes

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: No errors (ignore warnings)

- [ ] **Step 2: Run Next.js build**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 3: Test API route manually**

Start dev server: `npm run dev`
Test health endpoint: `curl http://localhost:3000/api/health`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify build and type checks pass"
```

---

## Task 5: Vercel Deployment Configuration

**Files:**
- Check: `vercel.json` (create if missing)
- Modify: Environment variables in Vercel dashboard

**Interfaces:**
- Consumes: Prisma 7 with pooling
- Produces: Vercel deployment with proper connection limits

- [ ] **Step 1: Create vercel.json if not exists**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

- [ ] **Step 2: Document Vercel environment variables**

Ensure these are set in Vercel dashboard:
- `DATABASE_URL`: Add `?connection_limit=1&pool_timeout=10` for serverless
- `AUTH_SECRET`: Generate new if needed
- `NEXTAUTH_URL`: Set to your Vercel domain

- [ ] **Step 3: Deploy to Vercel**

```bash
vercel deploy --prod
```

- [ ] **Step 4: Monitor connection pool metrics**

After deployment, check Vercel logs for connection errors.

- [ ] **Step 5: Final commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel deployment configuration"
```

---

## Summary of Breaking Changes

| Package | Old → New | Action Required |
|---------|-----------|-----------------|
| Prisma | 5.22 → 7.8 | Schema update, client refactor, pooling auto-enabled |
| Zod | 3.25 → 4.4 | Schemas mostly compatible, test validation |
| bcryptjs | 2.4 → 3.0 | No code changes, API identical |
| uuid | 9.0 → 14.0 | No code changes needed |
| multer | 1.4 → 2.2 | Minor API changes, test file uploads |
| pdfmake | 0.2 → 0.3 | Check PDF generation output |
| framer-motion | 11 → 12 | Check animations, mainly CSS changes |

---

## Rollback Plan

If issues arise:

```bash
# Revert to specific commit
git revert <commit-hash>

# Or checkout specific versions
npm install @prisma/client@5.22.0 prisma@5.22.0 zod@3.25.76 bcryptjs@2.4.3
```
