# ShoreStack Vault — Restart Instructions

## For the next Claude session: Phase 14 + 15 Build

### Context
Read these files first to understand the project:
1. `CLAUDE.md` — Full project overview, tech stack, database schema, brand guidelines
2. `docs/PHASE-14-15-BUILD-PLAN.md` — Detailed build plan for browser extension + PWA + biometric

### What's been done
- Phases 1–13 are complete and deployed at https://password-mu.vercel.app
- The build plan for Phases 14–15 has been researched and documented
- CLAUDE.md has been updated with extension and PWA architecture sections

### What to build next

**Start with Phase 14A: Extension Scaffold**
1. Create `extension/` directory with Vite + React + TypeScript + Tailwind
2. Add CRXJS plugin for Manifest V3 development
3. Set up `manifest.json` with correct permissions
4. Copy `lib/crypto.ts` → `extension/src/shared/crypto.ts`
5. Copy relevant types from `types/vault.ts` → `extension/src/shared/types.ts`
6. Verify the extension loads in Chrome (`chrome://extensions` → Load unpacked)

**Then Phase 14B: Service Worker & Auth**
7. Build service worker with Supabase auth (email + password login)
8. Implement vault session in service worker memory (same 15min auto-lock pattern)
9. Set up message passing protocol between popup ↔ service worker ↔ content scripts

**Then continue through 14C → 14F, then 15A → 15F** (see build plan for details)

### Key files to read before coding
- `lib/crypto.ts` — All encryption logic (copy this for extension)
- `lib/vault-session.ts` — In-memory vault key management (replicate pattern for extension)
- `lib/supabase.ts` — Browser Supabase client (adapt for extension)
- `types/vault.ts` — All TypeScript types
- `app/(vault)/dashboard/page.tsx` — Vault unlock + item display logic
- `components/vault/PasswordGenerator.tsx` — Reuse in extension popup

### Environment
- **Framework:** Next.js 16 (App Router) + Turbopack
- **Node:** Check with `node -v` (project uses Node 20+)
- **Package manager:** npm
- **Build:** `npm run build` from project root
- **Dev:** `npm run dev` for web app, `cd extension && npm run dev` for extension

### Database
- **Supabase project:** qdhwgzftpycdmovyniec
- **Phase 15C requires SQL migration** — add WebAuthn columns to profiles table (SQL in build plan)

### Security rules (never break these)
- Vault key never stored in storage, localStorage, IndexedDB, or cookies
- IndexedDB stores only AES-256-GCM ciphertext
- WebAuthn requires `userVerification: 'required'`
- Autofill only on explicit user action
- Master password never stored anywhere
- Content scripts run in isolated world
