# 🔖 Smart Bookmark Manager

A secure, real-time bookmark management application built using **Next.js (App Router)** and **Supabase**.

This project demonstrates:

- Secure Google OAuth authentication
- Strict user-level data isolation using Row Level Security (RLS)
- Real-time updates without page refresh
- Clean, modern UI with Tailwind CSS
- Production deployment on Vercel

---

## 🚀 Live Demo

🔗 Live Application (Vercel):  
https://smart-bookmark-app-eight-theta.vercel.app

📂 Public GitHub Repository:  
https://github.com/Aniketm09/Smart-Bookmark-App

---

## ✨ Features

- 🔐 Google OAuth Authentication (Supabase Auth)
- ➕ Add bookmarks (Title + URL)
- 🗑 Delete own bookmarks
- 🔒 Private bookmarks per user (RLS enforced)
- ⚡ Real-time sync across multiple tabs
- 🎨 Clean and user-friendly interface
- 🚀 Deployed on Vercel

---

## 🏗 Architecture Overview

### Frontend

- Next.js 14+ (App Router)
- React Hooks (useState, useEffect)
- Tailwind CSS

### Backend

- Supabase (Authentication + PostgreSQL + Realtime)
- Row Level Security (RLS)
- Postgres Realtime replication

---

## 🔐 Authentication Flow

1. User logs in using Google OAuth.
2. Supabase manages authentication and session.
3. Session is validated on page load.
4. Unauthorized users are redirected to `/login`.

Authentication is fully handled by Supabase Auth.

---

## 🗄 Database Schema

```sql
create extension if not exists "uuid-ossp";

create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  url text not null,
  created_at timestamp default now()
);
```

````

---

## 🔒 Row Level Security (RLS)

RLS ensures complete user-level data isolation.

Enabled using:

```sql
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
```

Policy used:

```sql
create policy "Users can manage own bookmarks"
on bookmarks
for all
using (auth.uid() = user_id);
```

### What This Ensures:

- User A cannot see User B's bookmarks
- Users can only insert/delete their own bookmarks
- Security is enforced at the database level

No frontend filtering is relied upon for security.

---

## ⚡ Real-Time Logic

Supabase Realtime is enabled for the `bookmarks` table.

```sql
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
```

Realtime subscription:

```javascript
supabase
  .channel(`user-bookmarks-${user.id}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "bookmarks",
      filter: `user_id=eq.${user.id}`,
    },
    fetchBookmarks,
  )
  .subscribe();
```

### Result:

- Adding a bookmark in one tab updates instantly in another tab
- Deleting a bookmark syncs immediately
- No manual page refresh required

---

## 🧠 Implementation Decisions

- Used Supabase instead of custom backend to simplify auth + database + realtime.
- Enforced security via RLS instead of frontend filtering.
- Implemented optimistic UI updates for instant user feedback.
- Filtered realtime events by `user_id` to ensure private updates.

---

## 🧩 Challenges Faced & Solutions

### 1️⃣ Realtime DELETE not updating instantly

**Problem:**
Bookmarks required refresh after deletion.

**Cause:**
Postgres was not sending full row data on DELETE.

**Solution:**

```sql
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
```

This enabled full payload delivery for DELETE events.

---

### 2️⃣ Realtime not triggering initially

**Problem:**
Changes were not syncing across tabs.

**Cause:**
Realtime replication was not enabled for the table.

**Solution:**
Enabled replication under:

Database → Replication → Enabled Realtime for `bookmarks`.

---

### 3️⃣ OAuth redirect failing after deployment

**Problem:**
Google login failed on production.

**Cause:**
Vercel URL not added in Supabase Auth settings.

**Solution:**

- Updated Site URL in Supabase.
- Added production URL to Redirect URLs.
- Verified Google OAuth redirect URI.

---

### 4️⃣ RLS blocking queries

**Problem:**
Operations failed due to missing policy.

**Solution:**
Added proper RLS policy to allow only owner access.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/smart-bookmark.git
cd smart-bookmark
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create `.env.local` in project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4️⃣ Supabase Configuration

- Create Supabase project
- Create `bookmarks` table
- Enable Row Level Security
- Add RLS policy
- Enable Realtime replication
- Enable Google OAuth
- Configure redirect URLs

### 5️⃣ Run Locally

```bash
npm run dev
```

Open:

```
http://localhost:3000
```


## 🚀 Deployment

Deployed using **Vercel**.

Steps:

1. Push project to GitHub.
2. Import repository in Vercel.
3. Add environment variables.
4. Add production URL to Supabase Auth settings.
5. Deploy.

---

## 🎯 Final Outcome

The application:

✔ Securely authenticates users
✔ Enforces strict user-level privacy
✔ Updates in real-time without refresh
✔ Supports multi-tab synchronization
✔ Works in production environment
✔ Is production-ready

---

## 📌 Tech Stack

- Next.js (App Router)
- Supabase
- PostgreSQL
- Supabase Realtime
- Google OAuth
- Tailwind CSS
- Vercel Deployment

---

## 📄 License

This project was built as part of a technical assessment

[https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
[https://github.com/your-username/smart-bookmark](https://github.com/your-username/smart-bookmark)

````
