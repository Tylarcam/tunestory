# 🎵 TuneStory

**Discover the perfect soundtrack for your moments**

TuneStory is an AI-powered application that analyzes the mood and context of your photos to recommend personalized music tracks that match the vibe. Built with Gemini 2.5 Flash for image analysis and Spotify API for music recommendations.

---

## ✨ Features

- **Photo Analysis**: Upload any photo and get AI-powered mood detection using Gemini Vision
- **Music Recommendations**: Automatically finds personalized Spotify tracks matching your photo's vibe
- **Mood Display**: View extracted mood, energy level, genres, and poetic descriptions
- **Audio Preview**: Built-in player with Spotify preview tracks and waveform visualization
- **Share & Discover**: Share your matches on Instagram, TikTok, Twitter, or copy links
- **Regeneration**: Get new recommendations with the same photo
- **Responsive Design**: Works seamlessly on mobile and desktop with beautiful glass morphism UI

---

## 🌐 For Users

TuneStory is a web application - **no installation required!** Simply visit the website and start uploading photos to discover your perfect soundtrack.

1. Visit the TuneStory website
2. Upload or drag & drop a photo
3. Wait for AI analysis (a few seconds)
4. Discover your personalized music recommendations
5. Preview tracks and share your favorites!

---

## 👨‍💻 For Developers

### Prerequisites

- Node.js 18+ and npm (or bun)
- Supabase account and project
- Lovable API key (for Gemini Vision API access)
- Spotify Developer account with Client ID and Secret

### Local Development Setup

To run TuneStory locally for development or contribution:

```bash
# Clone the repository
git clone https://github.com/yourusername/tunestory-vibes.git
cd tunestory-vibes

# Install dependencies
npm install
# or
bun install

# Set up environment variables
# Create a .env file in the root directory with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Set up Supabase Edge Functions environment variables
# In your Supabase dashboard, go to Edge Functions > Settings
# Add the following secrets:
LOVABLE_API_KEY=your_lovable_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Start development server
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

**Frontend (.env):**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Supabase Edge Functions (set in Supabase Dashboard):**
- `LOVABLE_API_KEY` - Your Lovable API key for Gemini Vision access
- `SPOTIFY_CLIENT_ID` - Spotify API client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify API client secret

---

## 🏗️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom glass morphism effects
- **shadcn-ui** for accessible component library
- **TanStack React Query** for data fetching and state management
- **React Router DOM** for routing
- **Lucide React** for icons

### AI/ML

- **Gemini 2.5 Flash** (via Lovable AI Gateway) for image analysis and mood extraction
- **Spotify Web API** for music recommendations and preview playback

### Backend

- **Supabase Edge Functions** (Deno runtime) for serverless API endpoints
- Two edge functions:
  - `analyze-image` - Processes images with Gemini Vision
  - `get-recommendations` - Searches Spotify for matching tracks

---

## 📁 Project Structure

```
tunestory-vibes/
├── src/
│   ├── components/
│   │   ├── PhotoUpload.tsx          # Drag & drop image upload
│   │   ├── LoadingState.tsx         # Loading animations
│   │   ├── MoodDisplay.tsx          # Mood analysis display
│   │   ├── SongCard.tsx             # Music track card with player
│   │   ├── ShareButtons.tsx         # Social sharing functionality
│   │   ├── RegenerateButton.tsx     # Regenerate recommendations
│   │   └── ui/                      # shadcn-ui components
│   ├── pages/
│   │   ├── Index.tsx                # Main application page
│   │   └── NotFound.tsx             # 404 page
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client
│   │       └── types.ts             # TypeScript types
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utility functions
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── supabase/
│   ├── functions/
│   │   ├── analyze-image/
│   │   │   └── index.ts             # Image analysis edge function
│   │   └── get-recommendations/
│   │       └── index.ts             # Spotify search edge function
│   └── config.toml                  # Supabase configuration
├── public/                          # Static assets
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite configuration
└── package.json                     # Dependencies
```

---

## 🎯 How It Works

1. **Photo Upload**: User drags and drops or selects a photo (JPG, PNG, WEBP)
2. **Image Analysis**: 
   - Photo is converted to base64 and sent to `analyze-image` edge function
   - Gemini 2.5 Flash analyzes the image and extracts:
     - Mood (single word or phrase)
     - Energy level (Low, Medium, High)
     - Suggested genres
     - Poetic one-sentence description
     - Spotify search terms for finding matching tracks
3. **Music Discovery**: 
   - `get-recommendations` edge function uses the analysis to search Spotify
   - Multiple search queries are built from search terms, genres, mood, and energy
   - Top 5 unique tracks are returned with preview URLs, album art, and Spotify links
4. **Playback & Sharing**: 
   - Users can preview tracks (30-second Spotify previews)
   - Share matches on social media or copy links
   - Regenerate to get new recommendations

---

## 🎨 Design System

### Color Palette

- **Primary**: Purple (`hsl(270, 80%, 60%)`) - Main brand color
- **Secondary**: Electric Blue (`hsl(200, 80%, 50%)`) - Accent color
- **Accent**: Warm Amber (`hsl(35, 90%, 55%)`) - Highlight color
- **Background**: Dark (`hsl(240, 10%, 4%)`) - Base background
- **Glass Morphism**: Semi-transparent cards with backdrop blur

### Typography

- **Display Font**: Space Grotesk (headings)
- **Body Font**: Inter (body text)

### Animations

- Fade-in-up animations for content
- Waveform visualization during playback
- Slow spin animation for album art when playing
- Pulse glow effects for interactive elements

---

## 📊 API Endpoints

### POST `/functions/v1/analyze-image`

Analyzes uploaded photo and returns mood parameters.

**Request:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "mood": "joyful",
  "energy": "High",
  "genres": ["Indie Pop", "Electronic", "Synthwave"],
  "description": "A moment of pure joy captured in golden light.",
  "searchTerms": ["indie pop summer vibes", "electronic upbeat", "synthwave nostalgic"]
}
```

### POST `/functions/v1/get-recommendations`

Searches Spotify for tracks matching the mood analysis.

**Request:**
```json
{
  "searchTerms": ["indie pop summer vibes", "electronic upbeat"],
  "genres": ["Indie Pop", "Electronic"],
  "mood": "joyful",
  "energy": "High"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "spotify_track_id",
      "name": "Track Name",
      "artist": "Artist Name",
      "album": "Album Name",
      "albumArt": "https://...",
      "previewUrl": "https://...",
      "spotifyUrl": "https://open.spotify.com/track/...",
      "genre": "Indie Pop"
    }
  ]
}
```

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Server

The development server runs on `http://localhost:8080` by default.

---

## 🚢 Deployment

### Supabase Edge Functions

Deploy edge functions using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy analyze-image
supabase functions deploy get-recommendations
```

### Frontend

The frontend can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Connect your GitHub repo and deploy
- **Supabase Hosting**: Use Supabase's built-in hosting

Make sure to set environment variables in your hosting platform.

---

## 📝 Notes

- Spotify preview tracks are 30-second samples provided by Spotify
- Some tracks may not have preview URLs available
- The app uses Spotify's client credentials flow (no user authentication required)
- Image analysis uses Lovable's AI Gateway which provides access to Gemini 2.5 Flash

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.
