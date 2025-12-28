# Spotify Authentication Audit & Fix Plan

## 🔍 Issues Identified

### 1. **Redirect URI Mismatch (CRITICAL)**
**Problem:** 
- Frontend constructs redirect URI dynamically: `${window.location.origin}${window.location.pathname}`
- Backend uses static fallback: `Deno.env.get("SPOTIFY_REDIRECT_URI") || "http://localhost:8080"`
- Spotify requires **EXACT MATCH** between authorization request and token exchange

**Impact:** Token exchange will fail with "invalid_grant" error

**Location:**
- Frontend: `src/components/SpotifyAuth.tsx:134`
- Backend: `supabase/functions/spotify-auth/index.ts:25`

---

### 2. **Complex Popup Flow (RELIABILITY)**
**Problem:**
- Current popup implementation tries to access `popup.location.href` which causes cross-origin errors
- Multiple polling mechanisms that may not work reliably
- Code handling happens in both `useEffect` and `handleLogin`

**Impact:** Unreliable authentication flow, especially in different browsers

**Location:** `src/components/SpotifyAuth.tsx:157-188`

---

### 3. **Missing State Parameter (SECURITY)**
**Problem:**
- No CSRF protection using `state` parameter
- Docs recommend using state to prevent CSRF attacks

**Impact:** Potential security vulnerability

---

### 4. **No Refresh Token Handling (EXPIRATION)**
**Problem:**
- Tokens expire after 1 hour
- No mechanism to refresh tokens automatically
- User must re-authenticate when token expires

**Impact:** Poor user experience

---

### 5. **Error Handling Incomplete**
**Problem:**
- Backend doesn't parse Spotify error responses properly
- Frontend doesn't handle specific error codes
- Generic error messages don't help with debugging

**Impact:** Difficult to diagnose issues

---

### 6. **Redirect URI Not Passed to Backend**
**Problem:**
- Frontend determines redirect URI but doesn't send it to backend
- Backend assumes it knows the redirect URI
- Mismatch between what's used in auth request vs token exchange

**Impact:** Token exchange fails

---

## 🛠️ Fix Plan

### Phase 1: Fix Redirect URI Handling (PRIORITY 1)

#### Step 1.1: Standardize Redirect URI
- Use consistent redirect URI construction
- Store base redirect URI in environment variable
- Ensure exact match between frontend and backend

#### Step 1.2: Send Redirect URI to Backend
- Include redirect_uri in the token exchange request
- Backend uses the provided redirect_uri instead of assuming

---

### Phase 2: Simplify OAuth Flow (PRIORITY 2)

#### Step 2.1: Use Full Page Redirect (Recommended by Spotify)
- Remove popup complexity
- Use standard redirect flow: `window.location.href = authUrl`
- Handle callback in `useEffect` only

#### Step 2.2: Alternative: Fix Popup Flow
- If popup is required, use postMessage for communication
- Or use simpler approach with window focus detection

---

### Phase 3: Add Security & Reliability (PRIORITY 3)

#### Step 3.1: Add State Parameter
- Generate random state string
- Store in sessionStorage
- Verify on callback

#### Step 3.2: Implement Refresh Token Flow
- Store refresh_token from initial auth
- Create refresh token endpoint
- Auto-refresh before expiry

---

### Phase 4: Improve Error Handling (PRIORITY 4)

#### Step 4.1: Parse Spotify Error Responses
- Backend: Extract error details from Spotify responses
- Frontend: Handle specific error codes with user-friendly messages

---

## 📋 Implementation Checklist

### Backend Fixes (`supabase/functions/spotify-auth/index.ts`)

- [ ] Accept `redirect_uri` from request body
- [ ] Use provided redirect_uri for token exchange
- [ ] Add validation to ensure redirect_uri matches pattern
- [ ] Parse and return Spotify error details
- [ ] Add refresh token endpoint (new function)

### Frontend Fixes (`src/components/SpotifyAuth.tsx`)

- [ ] Use consistent redirect URI (from env or standardize)
- [ ] Simplify to full-page redirect (remove popup complexity)
- [ ] Send redirect_uri to backend in token exchange
- [ ] Add state parameter generation and verification
- [ ] Store refresh_token for future use
- [ ] Implement token refresh logic
- [ ] Improve error handling with specific error codes
- [ ] Handle callback only in useEffect (remove duplicate)

### Configuration

- [ ] Document required environment variables
- [ ] Update SPOTIFY_REDIRECT_URI to match exactly
- [ ] Update Spotify App settings with correct redirect URIs

---

## 🎯 Recommended Implementation Order

1. **Fix redirect URI mismatch** (blocks everything)
2. **Simplify OAuth flow** (improves reliability)
3. **Add state parameter** (security)
4. **Add refresh token handling** (UX improvement)
5. **Improve error handling** (debugging)

---

## 📝 Code Changes Overview

### Backend Changes:
1. Accept `redirect_uri` in request body
2. Use it for token exchange
3. Better error parsing

### Frontend Changes:
1. Standardize redirect URI
2. Switch to full-page redirect
3. Add state parameter
4. Send redirect_uri to backend
5. Store and use refresh tokens

### New Function Needed:
- `refresh-token` - handles token refresh using refresh_token

---

## 🔐 Security Considerations

1. **State Parameter**: Prevents CSRF attacks
2. **Redirect URI Validation**: Prevents redirect URI manipulation
3. **Token Storage**: Consider httpOnly cookies for production (future enhancement)
4. **HTTPS Only**: Ensure production uses HTTPS

---

## 📚 Reference Documentation

From Spotify docs:
- Authorization Code Flow: `/authorize` → `/api/token`
- Redirect URI must match exactly
- State parameter recommended for security
- Refresh tokens available for long-term access
- Token expires in 3600 seconds (1 hour)

