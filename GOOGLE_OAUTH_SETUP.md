# Setting Up Google OAuth (Step-by-Step)

Since I cannot log in to your Google account for you, you need to generate the "Client ID" and "Client Secret" manually. It takes about 2 minutes.

## 1. Create Project on Google Cloud
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the specific project dropdown in the top bar (e.g., "Select a project") and click **"New Project"**.
3. Name it `FoodOrderingApp` and click **Create**.

## 2. Configure OAuth Consent Screen
1. In the search bar at the top, type **"OAuth Consent Screen"** and select it.
2. Select **External** (unless you have a G-Suite organization) and click **Create**.
3. Fill in:
   - **App Name**: FoodHub
   - **User Support Email**: Your email.
   - **Developer Contact Information**: Your email.
4. Click **Save and Continue** until you finish (you don't need to add scopes/test users yet).

## 3. Get Credentials (The Key Part)
1. Go to **Credentials** (left sidebar).
2. Click **+ CREATE CREDENTIALS** -> **OAuth client ID**.
3. **Application Type**: Select **Web application**.
4. **Name**: `FoodHub Web`.
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:5000`
   - Add: `http://localhost:5173` (Your frontend)
6. **Authorized redirect URIs** (Important!):
   - Add: `http://localhost:5000/api/auth/google/callback`
7. Click **Create**.

## 4. Copy Keys to .env
A pop-up will show your keys.
1. Copy **Your Client ID**.
2. Paste it into `server/.env` as `GOOGLE_CLIENT_ID`.
3. Copy **Your Client Secret**.
4. Paste it into `server/.env` as `GOOGLE_CLIENT_SECRET`.

---

## 5. Restart Server
After saving `.env`, you **MUST** restart your backend server:
1. Click in the terminal where `npm run dev` is running.
2. Press `Ctrl + C` to stop it.
3. Run `npm run dev` again.
