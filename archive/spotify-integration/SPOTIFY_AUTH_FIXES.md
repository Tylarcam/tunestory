# Spotify Authentication Fixes Applied

## ✅ Changes Made

### 1. Fixed Redirect URI Mismatch (CRITICAL FIX)

**Problem:** Redirect URI used in authorization request didn't match token exchange.

**Solution:**
- Frontend now sends `redirect_uri` to backend in token exchange request
- Backend uses the provided `redirect_uri` (must match exactly)
- Added validation for allowed redirect URIs

**Files Changed:**
- `src/components/SpotifyAuth.tsx`: Added `getRedirectUri()` helper, sends redirect_uri to backend
- `supabase/functions/spotify-auth/index.ts`: Accepts redirect_uri from request body

---

### 2. Simplified OAuth Flow

**Problem:** Complex popup implementation with cross-origin issues.

**Solution:**
- Removed popup complexity
- Using full-page redirect (recommended by Spotify)
- Callback handled only in `useEffect` (removed duplicate handling)

**Files Changed:**
- `src/components/SpotifyAuth.tsx`: Simplified `handleLogin()` to use `window.location.href`

---

### 3. Added State Parameter (CSRF Protection)

**Problem:** No CSRF protection.

**Solution:**
- Generate random state parameter using `crypto.randomUUID()`
- Store in `sessionStorage`
- Verify on callback

**Files Changed:**
- `src/components/SpotifyAuth.tsx`: Added state generation and verification

---

### 4. Improved Error Handling

**Problem:** Generic error messages, no detailed error info from Spotify.

**Solution:**
- Backend now parses Spotify error responses
- Returns detailed error messages to frontend
- Frontend displays specific error descriptions

**Files Changed:**
- `supabase/functions/spotify-auth/index.ts`: Parse and return Spotify errors
- `src/components/SpotifyAuth.tsx`: Display detailed error messages

---

### 5. Added Refresh Token Support

**Problem:** No refresh token storage.

**Solution:**
- Store refresh_token from initial auth
- Clear on logout/expiry
- (Refresh logic can be added later)

**Files Changed:**
- `src/components/SpotifyAuth.tsx`: Store and clear refresh_token

---

## 🔧 Configuration Required

### Frontend Environment Variables (.env)

Add to your `.env` file:

```bash
# Spotify Client ID (public, safe to expose)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id

# Optional: Explicit redirect URI (if different from current origin)
# If not set, will use: window.location.origin + window.location.pathname
VITE_SPOTIFY_REDIRECT_URI=http://localhost:8080
```

**For Production:**
```bash
VITE_SPOTIFY_CLIENT_ID=your_production_client_id
VITE_SPOTIFY_REDIRECT_URI=https://your-production-domain.com
```

---

### Backend Environment Variables (Supabase Dashboard)

Go to: **Supabase Dashboard → Edge Functions → Settings → Secrets**

Add these secrets:

```bash
# Required
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Optional: Allowed redirect URIs (comma-separated, for security validation)
# If not set, will allow localhost and any URI starting with allowed prefixes
SPOTIFY_ALLOWED_REDIRECT_URIS=http://localhost:8080,https://your-domain.com
```

---

### Spotify App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click **Edit Settings**
4. Under **Redirect URIs**, add **EXACT** matches:

**For Development:**
```
http://localhost:8080
```

**For Production:**
```
https://your-production-domain.com
```

**Important:** 
- URIs must match **EXACTLY** (including http/https, trailing slashes, ports)
- Add all environments you'll use
- The redirect URI in your code must match one of these

---

## 🧪 Testing the Fix

### Step 1: Verify Configuration

1. Check `.env` has `VITE_SPOTIFY_CLIENT_ID`
2. Check Supabase secrets are set
3. Verify Spotify app redirect URIs match

### Step 2: Test Authentication Flow

1. Start dev server: `npm run dev`
2. Click "Connect Spotify"
3. Should redirect to Spotify login
4. After login, should redirect back
5. Should show "Connected to Spotify!" toast
6. Should display user profile

### Step 3: Check for Errors

**Common Issues:**

1. **"invalid_grant" error**
   - Check redirect URI matches exactly in Spotify app settings
   - Check redirect_uri sent to backend matches auth request

2. **"Configuration error"**
   - Verify `VITE_SPOTIFY_CLIENT_ID` is set in `.env`
   - Restart dev server after adding env vars

3. **"Security validation failed"**
   - This means state parameter mismatch (shouldn't happen with new code)
   - Clear browser cache and try again

4. **CORS errors**
   - Check Supabase function CORS headers are correct
   - Verify function is deployed

---

## 📋 Checklist

Before deploying:

- [ ] `VITE_SPOTIFY_CLIENT_ID` set in `.env`
- [ ] `SPOTIFY_CLIENT_ID` set in Supabase secrets
- [ ] `SPOTIFY_CLIENT_SECRET` set in Supabase secrets
- [ ] Spotify app redirect URIs configured
- [ ] Redirect URIs match exactly (no trailing slashes if not in code)
- [ ] Test authentication flow locally
- [ ] Test in production environment
- [ ] Verify tokens are stored correctly
- [ ] Check browser console for errors

---

## 🔄 Next Steps (Optional Enhancements)

### 1. Implement Token Refresh

Create `supabase/functions/refresh-token/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { refresh_token } = await req.json();
  
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });
  
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### 2. Auto-Refresh Before Expiry

Add to `SpotifyAuth.tsx`:

```typescript
useEffect(() => {
  if (!accessToken) return;
  
  const expiryTime = parseInt(localStorage.getItem("spotify_token_expiry") || "0");
  const timeUntilExpiry = expiryTime - Date.now();
  
  // Refresh 5 minutes before expiry
  if (timeUntilExpiry < 5 * 60 * 1000) {
    refreshToken();
  }
}, [accessToken]);
```

### 3. Use httpOnly Cookies (Production)

For better security, consider storing tokens in httpOnly cookies instead of localStorage.

---

## 📚 Reference

- [Spotify Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Spotify API Reference](https://developer.spotify.com/documentation/web-api)

---

## 🐛 Debugging Tips

1. **Check Network Tab:**
   - Look for `/spotify-auth` request
   - Check request payload includes `redirect_uri`
   - Check response for error details

2. **Check Console:**
   - Look for error messages
   - Check localStorage: `localStorage.getItem("spotify_access_token")`
   - Check sessionStorage: `sessionStorage.getItem("spotify_oauth_state")`

3. **Verify Redirect URI:**
   - Log the redirect URI in `getRedirectUri()`
   - Ensure it matches Spotify app settings exactly

4. **Test Token Exchange:**
   - Use Postman/curl to test the edge function directly
   - Verify credentials are correct

