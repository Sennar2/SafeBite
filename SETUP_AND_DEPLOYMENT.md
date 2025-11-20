# Easy Bites Multi-Tenant Setup & Deployment Guide

## 🎯 Overview

You now have a complete, production-ready multi-tenant version of Easy Bites with role-based access control. This guide will walk you through setting up and deploying the application.

## ✅ What's Already Done

- ✅ Database migration executed successfully
- ✅ New multi-tenancy code integrated
- ✅ Core components updated (App.tsx, Header.tsx, Dashboard.tsx)
- ✅ Authentication and authorization system implemented
- ✅ Company and location selectors added to UI
- ✅ Role-based access control configured

## 📋 Prerequisites

Before you start, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **npm** or **pnpm** - Usually comes with Node.js
3. **Git** - [Download](https://git-scm.com/)
4. **Supabase Account** - Already set up with the database migration executed
5. **Text Editor** - VS Code recommended

## 🚀 Local Setup (Development)

### Step 1: Extract the ZIP File

```bash
unzip easy-bites-multi-tenant.zip
cd easy-bites
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://ebykgbdqavaqyhxeqrxk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to get these values:**
1. Go to https://supabase.com/dashboard/project/ebykgbdqavaqyhxeqrxk
2. Click "Settings" → "API"
3. Copy the "Project URL" and "anon public" key

### Step 4: Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

The application should now be running at `http://localhost:5173`

### Step 5: Create Initial Data

Before you can log in, you need to set up:

1. **Create a Super User Account**
   - Go to your Supabase dashboard
   - Navigate to Authentication → Users
   - Create a new user (or use your existing account)
   - Go to Table Editor → profiles
   - Update the user's profile:
     - Set `role` to `super_user`
     - Leave `company_id` empty (super users access all companies)

2. **Create Companies**
   - Go to Table Editor → companies
   - Insert company records:
     ```
     Name: "Your Restaurant Name"
     Description: "Restaurant description"
     Address: "123 Main St"
     is_active: true
     ```

3. **Create Locations**
   - Go to Table Editor → locations
   - For each location, set:
     - `name`: Location name
     - `company_id`: The company UUID
     - `address`: Location address

4. **Assign Users to Companies**
   - Go to Table Editor → profiles
   - For each user, set:
     - `company_id`: The company UUID
     - `role`: One of: `company_admin`, `ops`, `manager`
     - If `role` is `manager`, assign locations via the `user_locations` table

### Step 6: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Sign In"
3. Enter your credentials
4. You should see the dashboard with your company and location information

## 🔍 Testing Multi-Tenancy

### Test Super User Access
1. Log in as a super user
2. Verify you can see all companies in the company selector
3. Verify you can see all locations in the location selector
4. Verify all features are available

### Test Company Admin Access
1. Create a company admin user
2. Log in as that user
3. Verify you can only see your company
4. Verify you can see all locations in your company
5. Verify you can create and manage checklists

### Test Manager Access
1. Create a manager user
2. Assign them to specific locations via the `user_locations` table
3. Log in as that user
4. Verify you can only see your assigned locations
5. Verify you cannot create checklists

## 📦 Deployment to Production

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Multi-tenant Easy Bites"
   git remote add origin https://github.com/YOUR_USERNAME/easy-bites.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Set environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Click "Deploy"

3. **Verify Deployment**
   - Visit your Vercel URL
   - Test login and basic functionality
   - Check browser console for errors

### Option 2: Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - Click "New site from Git"
   - Select your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variables in "Site settings" → "Build & deploy"
   - Deploy

### Option 3: Deploy to Your Own Server

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure your web server** to serve `index.html` for all routes (for React Router)

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Verify RLS policies are enabled on all tables
- [ ] Test data segregation between companies
- [ ] Verify users cannot access other companies' data
- [ ] Enable HTTPS on your domain
- [ ] Set up proper CORS headers in Supabase
- [ ] Configure email verification for new users
- [ ] Set up backup strategy for database
- [ ] Monitor Supabase logs for suspicious activity
- [ ] Test role-based access control thoroughly

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:** Run `npm install` again to ensure all dependencies are installed.

### Issue: Blank page after login

**Solution:** 
1. Check browser console for errors (F12)
2. Verify your Supabase URL and API key are correct
3. Check that your user profile exists in the `profiles` table
4. Verify the user has a `company_id` set

### Issue: "RLS policy violation" error

**Solution:**
1. Verify the user's `company_id` matches the data's `company_id`
2. Check that RLS policies are enabled on the table
3. Review Supabase logs for detailed error messages

### Issue: Manager cannot see assigned locations

**Solution:**
1. Verify the manager's `user_locations` entries exist
2. Check that `location_id` values are correct UUIDs
3. Verify the locations have the correct `company_id`

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main application entry point with routing |
| `src/context/AuthContext.tsx` | Authentication and user profile management |
| `src/context/MultiTenancyContext.tsx` | Company and location management |
| `src/utils/multiTenancy.ts` | RBAC utilities and permission checking |
| `src/auth/ProtectedRoute.tsx` | Route protection with role checking |
| `src/components/CompanySelector.tsx` | Company switcher UI |
| `src/components/LocationSelector.tsx` | Location switcher UI |
| `migrations/001_add_multi_tenancy.sql` | Database schema migration |

## 🎓 Learning Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Easy Bites Multi-Tenancy Quick Reference](./MULTI_TENANCY_QUICK_REFERENCE.md)
- [Easy Bites Implementation Guide](./MULTI_TENANCY_IMPLEMENTATION_GUIDE.md)

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the documentation files in the project
3. Check Supabase logs for database errors
4. Check browser console for JavaScript errors
5. Review the implementation guide for best practices

## 🎉 Next Steps

1. **Set up initial data** (companies, users, locations)
2. **Test the application** locally
3. **Deploy to production** using one of the deployment options
4. **Monitor the application** for errors and performance
5. **Gather user feedback** and iterate

## 📋 Deployment Checklist

- [ ] Database migration executed successfully
- [ ] Environment variables configured
- [ ] Initial data created (companies, users, locations)
- [ ] Local testing completed for all roles
- [ ] Security checklist items completed
- [ ] Deployment platform configured
- [ ] Application deployed to production
- [ ] Production testing completed
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented

---

**Version:** 1.0.0
**Last Updated:** November 19, 2025
**Status:** Ready for Production
