# Supabase Setup Guide for Lexi Chat

## 🚀 Quick Start

This guide will walk you through setting up Supabase for the Lexi Chat application.

## 📋 Prerequisites

- Supabase account (create at https://supabase.com)
- Node.js 18+ and pnpm installed
- Access to your Supabase project credentials

## 🔧 Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Name your project: `lexi`
4. Set a strong database password (save this!)
5. Select your region (choose closest to your users)
6. Click "Create new project"

## 🔑 Step 2: Get Your API Keys

Once your project is created:

1. Go to Settings → API in your Supabase dashboard
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 📝 Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🗄️ Step 4: Set Up Database

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click "Run" to execute the migration

### Option B: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Run migrations:
```bash
supabase db push
```

## 🔐 Step 5: Enable Authentication Providers

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable "Email" provider for email/password authentication
3. Configure email templates as needed
4. (Optional) Enable social providers like Google, GitHub, etc.

## 📧 Step 6: Configure Email Settings

1. Go to Authentication → Email Templates
2. Customize the confirmation email template
3. Set up SMTP if you want custom email sending (optional)

## 🛡️ Step 7: Verify Row Level Security (RLS)

The migration script already sets up RLS policies, but verify they're enabled:

1. Go to Database → Tables
2. For each table (profiles, chats, messages, etc.)
3. Ensure RLS is enabled (shield icon should be green)

## 🚦 Step 8: Test Your Setup

1. Start the development server:
```bash
pnpm dev
```

2. Navigate to http://localhost:3000
3. Try registering a new account
4. Check Supabase Dashboard → Authentication → Users to see the new user

## 📊 Step 9: (Optional) Set Up Storage

If you want to use Supabase Storage instead of Vercel Blob:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `chat-attachments`
3. Set it to public or private based on your needs
4. Update the storage configuration in the app

## 🔍 Monitoring & Debugging

### Check Logs
- Go to Logs → API Logs in Supabase Dashboard
- Monitor authentication attempts and database queries

### Test Database Connection
Run this in SQL Editor to verify setup:
```sql
SELECT * FROM auth.users LIMIT 1;
SELECT * FROM public.profiles LIMIT 1;
```

## ⚠️ Common Issues & Solutions

### Issue: Authentication not working
- **Solution**: Check that your environment variables are correctly set
- Verify the Supabase URL doesn't have trailing slashes
- Ensure anon key is the public one, not service role

### Issue: RLS policies blocking access
- **Solution**: Check user is properly authenticated
- Verify RLS policies match your use case
- Use service role key for admin operations

### Issue: Database migrations fail
- **Solution**: Make sure you're connected to the right project
- Check for syntax errors in SQL
- Ensure extensions (uuid-ossp, vector) are available

## 🎯 Next Steps

After completing this setup:

1. Update authentication components to use Supabase
2. Migrate existing data if needed
3. Configure AI providers (XAI_API_KEY, etc.)
4. Test the chat functionality
5. Deploy to production

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

If you encounter issues:
1. Check the Supabase Discord community
2. Review the error logs in Supabase Dashboard
3. Ensure all environment variables are correctly set
4. Verify database migrations ran successfully

---

**Note**: Remember to never commit your `.env.local` file to version control!