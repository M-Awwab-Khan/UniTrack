# Admin Account Creation Guide

This guide will help you create an admin account directly in the database for your UniTrack application.

## Prerequisites

Before running the seed script, make sure you have:

1. **Database Connection**: Your database must be running and accessible
2. **Environment Variables**: Set up your `DATABASE_URL` environment variable

## Setup Steps

### 1. Configure Environment Variables

You need to set the `DATABASE_URL` environment variable. You can do this in one of two ways:

#### Option A: Create a `.env` file (Recommended)

Create a `.env` file in the root of your project (`/home/bytecorp/Awwab/uni-track/.env`):

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

Replace with your actual database credentials.

#### Option B: Export in Terminal

```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
```

### 2. Customize Admin Credentials

Edit the file `/home/bytecorp/Awwab/uni-track/packages/db/src/seed-admin.ts` and change these values:

```typescript
const adminEmail = "admin@unitrack.com";      // Change this
const adminPassword = "Admin@123456";          // Change this to a strong password
const adminName = "Admin User";                // Change this
```

### 3. Run the Seed Script

From the root of your project, run:

```bash
bun run --filter @uni-track/db seed:admin
```

Or from the `packages/db` directory:

```bash
cd packages/db
bun run seed:admin
```

### 4. Expected Output

If successful, you should see:

```
🔐 Creating admin account...
Email: admin@unitrack.com
Name: Admin User
✅ User created
✅ Account created
✅ Admin profile created

🎉 Admin account created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@unitrack.com
🔑 Password: Admin@123456
🆔 User ID: <generated-id>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Please save these credentials securely!
```

## What the Script Does

The seed script performs the following actions:

1. **Generates unique IDs** for the user, account, and admin profile
2. **Hashes the password** using Better Auth's secure password hashing
3. **Creates a user record** with role set to "admin"
4. **Creates an account record** for email/password authentication
5. **Creates an admin profile** linked to the user

## Database Tables Modified

- `user` - Main user record with admin role
- `account` - Authentication credentials (email/password)
- `admin_profile` - Admin-specific profile data

## Troubleshooting

### Error: "connect ECONNREFUSED"

This means the database is not accessible. Check:
- Is your database running?
- Is the `DATABASE_URL` correct?
- Can you connect to the database using a client?

### Error: "unique constraint violation"

An account with this email already exists. Either:
- Use a different email address
- Delete the existing account from the database

### Error: "Cannot find module 'better-auth'"

Run `bun install` from the project root to install dependencies.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change the default password** before running the script
2. **Use a strong password** with a mix of uppercase, lowercase, numbers, and special characters
3. **Don't commit** the `.env` file or credentials to version control
4. **Change the admin password** after first login through your application
5. **Delete or secure** the seed script after use in production

## Next Steps

After creating the admin account:

1. Log in to your application using the admin credentials
2. Change the password through your application's UI
3. Set up any additional admin users if needed
4. Consider implementing 2FA for admin accounts

## Files Created/Modified

- ✅ `/home/bytecorp/Awwab/uni-track/packages/db/src/seed-admin.ts` - Seed script
- ✅ `/home/bytecorp/Awwab/uni-track/packages/db/package.json` - Added `seed:admin` script
