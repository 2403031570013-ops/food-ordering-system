# MongoDB Atlas Setup Guide 🗄️

## Current Issue
Your application cannot connect to MongoDB Atlas due to authentication failure. This guide will help you fix it.

## Quick Fix Steps (5 minutes)

### Step 1: Go to MongoDB Atlas
1. Open https://cloud.mongodb.com/
2. Sign in with your account
3. Select your project (or create a new one)

### Step 2: Fix Network Access
1. Click **"Network Access"** in the left sidebar
2. Click **"+ ADD IP ADDRESS"**
3. Click **"ALLOW ACCESS FROM ANYWHERE"**
4. Click **"Confirm"**
   
   ⚠️ This adds `0.0.0.0/0` which allows connections from any IP (good for development, not for production)

### Step 3: Check Database User
1. Click **"Database Access"** in the left sidebar
2. Look for user: `2403031570013_db_user`
3. If it doesn't exist, create it:
   - Click **"+ ADD NEW DATABASE USER"**
   - Authentication Method: **Password**
   - Username: `2403031570013_db_user` (or create your own)
   - Password: `MyStrongPass123` (or create your own - remember it!)
   - Database User Privileges: Select **"Atlas Admin"** or **"Read and write to any database"**
   - Click **"Add User"**

### Step 4: Get Connection String
1. Click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Driver: **Node.js** | Version: **5.5 or later**
5. Copy the connection string
6. It looks like: `mongodb+srv://<username>:<password>@cluster...`

### Step 5: Update .env File
1. Open `server/.env`
2. Replace the `MONGO_URI` line with your new connection string
3. Make sure to:
   - Replace `<username>` with your database username
   - Replace `<password>` with your actual password
   - Replace `<dbname>` or add `?retryWrites=true&w=majority`

Example:
```
MONGO_URI=mongodb+srv://myusername:mypassword@cluster0.abc123.mongodb.net/foodapp?retryWrites=true&w=majority
```

### Step 6: Restart Server
1. Stop the backend server (Ctrl+C in terminal)
2. Run `npm run start` again
3. You should see: **"✅ MongoDB Connected Successfully"**

---

## Alternative: Create New FREE MongoDB Database

If the above doesn't work, create a completely new database:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free account)
3. Choose **"Create a deployment"**
4. Select **FREE tier** (M0 - 512MB storage)
5. Cloud Provider: Any (AWS recommended)
6. Region: Choose closest to you
7. Cluster Name: Any name you like
8. Click **"Create Deployment"**
9. **Important**: Save the username and password shown!
10. Click **"Network Access"** → Add IP → **"Allow from anywhere"** (0.0.0.0/0)
11. Get connection string and update `.env`

---

## Testing Connection

After updating `.env`:

1. Restart backend: `npm run start`
2. Check console output:
   - ✅ Success: `MongoDB Connected Successfully`
   - ❌ Error: `MongoDB Connection Error: ...`

3. If still failing, check:
   - Is your internet connection working?
   - Did you whitelist IP 0.0.0.0/0?
   - Is the password correct (no special characters causing issues)?
   - Is your cluster active and running?

---

## Common Errors

| Error | Solution |
|-------|----------|
| `MongoServerError: bad auth` | Wrong username/password - recreate user |
| `MongooseServerSelectionError` | IP not whitelisted - add 0.0.0.0/0 |
| `ENOTFOUND` | Wrong cluster URL - get fresh connection string |
| `connect ECONNREFUSED` | Trying to connect to local MongoDB - use Atlas URI |

---

## Need Help?

If you're still stuck:
1. Take a screenshot of the error
2. Check MongoDB Atlas status: https://status.mongodb.com/
3. Try creating a brand new cluster
4. Use MongoDB community forums: https://www.mongodb.com/community/forums/
