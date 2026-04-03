# TejBan - AI Startup Builder

TejBan turns one startup idea into a full startup blueprint, then helps you export, save, and deploy faster.

## Implemented Next Steps

- Real PDF export for:
  - Business plan
  - Pitch deck
- Supabase auth + project save history
- Landing page code generator:
  - Full HTML output
  - React component output
- One-click deploy hooks:
  - Netlify
  - Vercel

## Stack

- Frontend: HTML, CSS, Vanilla JS
- Backend: Node.js + Express
- AI: Google Gemini API (fallback mode if key missing)
- Auth + DB: Supabase
- PDF: PDFKit

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Fill `.env` as needed:

- `GEMINI_API_KEY` (optional but recommended — get from https://aistudio.google.com/app/apikey)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NETLIFY_DEPLOY_HOOK_URL` (optional)
- `VERCEL_DEPLOY_HOOK_URL` (optional)

4. Run:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Required Supabase Table

Create this table in Supabase SQL editor:

```sql
create table if not exists public.startup_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  idea_input jsonb not null,
  blueprint jsonb not null,
  landing_code jsonb,
  created_at timestamptz not null default now()
);

alter table public.startup_projects enable row level security;

create policy "users_read_own_projects"
on public.startup_projects
for select
to authenticated
using (auth.uid() = user_id);

create policy "users_insert_own_projects"
on public.startup_projects
for insert
to authenticated
with check (auth.uid() = user_id);
```

## Recommended Supabase Auth Settings

In Supabase Dashboard -> Authentication -> Providers / Settings:

- Enable Email provider
- Enable Confirm email
- Set minimum password length to 8 or higher
- Enable leaked password protection
- (Optional) Add OAuth providers (Google/GitHub) later

Set your project URL and redirect URL to your app URL, for local:

- `http://localhost:3000`

## Profile Settings Behavior

- `General Settings` now updates the signed-in user's Supabase auth metadata:
  - `full_name`
  - `date_of_birth`
  - `headline`
  - `website`
- Optional profile photo upload updates `avatar_url` in metadata.
- Profile values are also cached in browser local storage for faster UI reloads.
- If the user is signed out, profile values cannot be synced until login.

## Profile Photo Storage Setup (Supabase)

Create a public bucket named `profile-assets` in Supabase Storage.

If you are adding the public-read policy from the Supabase dashboard UI as shown in the screenshot, use:

- Policy name: `users_read_profile_assets`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `bucket_id = 'profile-assets'`

Important:

- In the dashboard `Policy definition` box, paste only the boolean expression, not a full `create policy ...` SQL statement.
- If you want to use the full SQL shown below, run it in the Supabase SQL editor instead of the storage policy form.

This app also uploads avatars from the browser with paths shaped like `<user-id>/avatar.<ext>`, so authenticated users also need insert/update access limited to their own folder.

Dashboard UI equivalents:

- Insert policy:
  - Policy name: `users_upload_own_avatar`
  - Allowed operation: `INSERT`
  - Target roles: `authenticated`
  - Policy definition: `bucket_id = 'profile-assets' and auth.uid()::text = (storage.foldername(name))[1]`
- Update policy:
  - Policy name: `users_update_own_avatar`
  - Allowed operation: `UPDATE`
  - Target roles: `authenticated`
  - `USING` expression: `bucket_id = 'profile-assets' and auth.uid()::text = (storage.foldername(name))[1]`
  - `WITH CHECK` expression: `bucket_id = 'profile-assets' and auth.uid()::text = (storage.foldername(name))[1]`
- Select policy:
  - Policy name: `users_read_profile_assets`
  - Allowed operation: `SELECT`
  - Target roles: `public`
  - Policy definition: `bucket_id = 'profile-assets'`

Recommended SQL policies:

```sql
create policy "users_upload_own_avatar"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users_update_own_avatar"
on storage.objects
for update
to authenticated
using (bucket_id = 'profile-assets' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'profile-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users_read_profile_assets"
on storage.objects
for select
to public
using (bucket_id = 'profile-assets');
```

Notes:

- The `users_read_profile_assets` policy is the one represented in the screenshot.
- `getPublicUrl()` depends on the bucket being public and the object belonging to `profile-assets`.
- The upload flow uses `upsert: true`, so keeping both `insert` and `update` policies is recommended.

## Auth Required Toast

- If a signed-out user clicks `Save Project` or `Load History`, a dedicated authentication toast appears.
- Toast actions allow direct login or dismissal.

## API Endpoints

- `GET /api/health`
- `GET /api/config`
- `POST /api/generate`
- `POST /api/generate-landing-code`
- `POST /api/export/json`
- `POST /api/export/business-plan-pdf`
- `POST /api/export/pitch-deck-pdf`
- `POST /api/history/save`
- `GET /api/history/list`
- `POST /api/account/delete`
- `POST /api/deploy/netlify`
- `POST /api/deploy/vercel`
