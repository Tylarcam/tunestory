# Spotify Music Mode Setup Guide

This guide explains how to set up the new "My Music" mode feature that allows users to analyze their Spotify playlists or liked songs to determine their vibe.

## Overview

The feature adds two modes to TuneStory:
1. **Photo Mode** (default): Analyzes photos using Gemini Vision
2. **Music Mode** (new): Analyzes user's Spotify playlists/liked songs using Spotify Audio Features API

## Prerequisites

1. Spotify Developer Account
2. Spotify App created in [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in:
   - **App name**: TuneStory (or your preferred name)
   - **App description**: AI-powered music vibe analyzer
   - **Redirect URI**: Add your app's URL (e.g., `http://localhost:8080` for dev, or your production URL)
   - **Website**: Your app's website URL
4. Save your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### Frontend (.env)

Add to your `.env` file:

```bash
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

**Note**: The Client ID can be public (it's used in the frontend). The Client Secret should NEVER be in the frontend.

### Supabase Edge Functions

In your Supabase Dashboard, go to **Edge Functions > Settings** and add these secrets:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:8080  # or your production URL
```

**Important**: The `SPOTIFY_REDIRECT_URI` must match exactly what you set in your Spotify App settings.

## Step 3: Deploy Edge Functions

Deploy the new edge functions:

```bash
# Deploy Spotify OAuth handler
supabase functions deploy spotify-auth

# Deploy music analyzer
supabase functions deploy analyze-music
```

## Step 4: Update Spotify App Redirect URIs

Make sure your Spotify App has the correct redirect URIs:

1. Go to your Spotify App in the Developer Dashboard
2. Click "Edit Settings"
3. Add all redirect URIs you'll use:
   - `http://localhost:8080` (development)
   - `https://your-production-domain.com` (production)
   - Any other environments you use

## How It Works

### User Flow

1. User clicks "My Music" mode toggle
2. User clicks "Connect Spotify" button
3. User is redirected to Spotify authorization page
4. User grants permissions:
   - `user-read-private` - Read user profile
   - `user-read-email` - Read user email
   - `user-library-read` - Read user's liked songs
   - `playlist-read-private` - Read private playlists
   - `playlist-read-collaborative` - Read collaborative playlists
5. User is redirected back with authorization code
6. Frontend exchanges code for access token via `spotify-auth` edge function
7. Token is stored in localStorage
8. User selects "Liked Songs" or a playlist
9. User clicks "Analyze My Music"
10. `analyze-music` edge function:
    - Fetches tracks from selected source
    - Gets audio features (energy, valence, tempo, etc.)
    - Analyzes features to determine mood, energy, genres
    - Returns vibe analysis
11. Recommendations are fetched based on the analysis

### Technical Details

#### Spotify OAuth Flow

The app uses the **Authorization Code Flow**:

1. User clicks "Connect Spotify"
2. Redirects to: `https://accounts.spotify.com/authorize?client_id=...&redirect_uri=...&scope=...&response_type=code`
3. User authorizes
4. Spotify redirects back with `?code=...`
5. Frontend sends code to `spotify-auth` edge function
6. Edge function exchanges code for access token
7. Token returned to frontend and stored

#### Music Analysis

The `analyze-music` function:

1. Fetches up to 50 tracks from user's selection
2. Gets audio features for each track using Spotify's Audio Features API
3. Calculates averages for:
   - **Energy** (0-1): Intensity and power
   - **Valence** (0-1): Positivity/happiness
   - **Tempo** (BPM): Speed
   - **Danceability** (0-1): How suitable for dancing
   - **Acousticness** (0-1): Acoustic vs electronic
   - **Instrumentalness** (0-1): Vocals vs instrumental
4. Determines:
   - **Mood**: Based on valence (Joyful, Upbeat, Melancholic, Somber)
   - **Energy**: Based on energy level (High, Medium, Low)
   - **Genres**: Based on characteristics (Acoustic, Electronic, Dance, etc.)
5. Generates search terms for recommendations

## API Endpoints

### POST `/functions/v1/spotify-auth`

Exchanges authorization code for access token.

**Request:**
```json
{
  "code": "authorization_code_from_spotify"
}
```

**Response:**
```json
{
  "access_token": "spotify_access_token",
  "expires_in": 3600,
  "refresh_token": "refresh_token"
}
```

### POST `/functions/v1/analyze-music`

Analyzes user's music to extract vibe.

**Request:**
```json
{
  "accessToken": "user_spotify_access_token",
  "playlistId": "playlist_id_or_liked"
}
```

**Response:**
```json
{
  "mood": "Joyful",
  "energy": "High",
  "genres": ["Pop", "Dance", "Electronic"],
  "description": "A joyful high energy, pop and dance vibes, upbeat tempo collection...",
  "searchTerms": ["joyful pop", "high energy dance vibes", "joyful upbeat"]
}
```

## Security Considerations

1. **Access Tokens**: Stored in localStorage (consider using httpOnly cookies for production)
2. **Token Expiry**: Tokens expire after 1 hour. Consider implementing refresh token logic
3. **Client Secret**: Never expose in frontend code
4. **Redirect URIs**: Must match exactly in Spotify App settings
5. **CORS**: Edge functions handle CORS headers

## Troubleshooting

### "Invalid redirect URI"
- Ensure redirect URI in Spotify App settings matches exactly (including http/https, trailing slashes, etc.)

### "Invalid client"
- Check that `VITE_SPOTIFY_CLIENT_ID` matches your Spotify App's Client ID

### "Failed to exchange authorization code"
- Check that `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REDIRECT_URI` are set correctly in Supabase
- Ensure redirect URI matches what's in Spotify App settings

### "No tracks found"
- User may not have any liked songs or the playlist may be empty
- Check that user granted `user-library-read` permission

### Token expires
- Implement refresh token logic (not included in initial implementation)
- Or prompt user to reconnect

## Future Enhancements

- [ ] Refresh token implementation
- [ ] Token storage in httpOnly cookies
- [ ] Playlist creation from recommendations
- [ ] Save analysis history
- [ ] Compare multiple playlists
- [ ] Export analysis as playlist

