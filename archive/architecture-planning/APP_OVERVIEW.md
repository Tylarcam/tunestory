# TuneStory - Application Overview

## Executive Summary

**TuneStory** is an AI-powered web application that transforms visual moments into personalized music experiences. By leveraging advanced computer vision and music recommendation algorithms, TuneStory analyzes photos to understand their emotional context, mood, and aesthetic qualities, then generates curated Spotify playlists that perfectly match the vibe captured in the image.

### Core Value Proposition

TuneStory bridges the gap between visual storytelling and musical expression, allowing users to:
- **Discover Music Through Visuals**: Upload any photo and instantly receive music recommendations that match the mood, energy, and aesthetic of the image
- **Personalize Music Discovery**: Two modes of operation - analyze photos for mood-based recommendations or analyze personal Spotify playlists to understand musical preferences
- **Share and Connect**: Easily share discovered tracks on social media platforms, creating a seamless connection between visual memories and musical soundtracks

### Key Differentiators

1. **AI-Powered Visual Analysis**: Uses Gemini 2.5 Flash Vision to extract nuanced emotional and contextual information from images
2. **Dual Discovery Modes**: 
   - Photo Mode: Image → Mood Analysis → Music Recommendations
   - Music Mode: Spotify Playlist → Audio Feature Analysis → Similar Music Discovery
3. **Seamless Integration**: Direct integration with Spotify API for authentic music previews and streaming links
4. **Modern UX**: Beautiful glass morphism design with responsive layout, smooth animations, and intuitive interactions

### Target Audience

- **Content Creators**: Social media users seeking music that matches their visual content
- **Music Enthusiasts**: Users looking to discover new music based on mood or aesthetic preferences
- **Photographers**: Creative professionals wanting to pair their work with complementary soundtracks
- **Casual Users**: Anyone interested in exploring the connection between visual and auditory experiences

### Business Model

Currently a free web application demonstrating AI capabilities and modern web development practices. Potential future monetization paths:
- Premium features (higher quality recommendations, more analysis options)
- API access for developers
- White-label solutions for brands
- Partnership opportunities with music streaming platforms

---

## Technical Overview

### Architecture Pattern

TuneStory follows a **modern serverless architecture** with clear separation between frontend and backend:

```
Frontend (Client-Side)          Backend (Serverless)          External APIs
┌────────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  React Application │  ────▶  │ Supabase Edge    │  ────▶  │ Gemini API   │
│  (Vite + TypeScript)│         │ Functions (Deno) │         │ Spotify API  │
└────────────────────┘         └──────────────────┘         └──────────────┘
```

### Deployment Model

- **Frontend**: Static site hosting (Vercel, Netlify, or Supabase Hosting)
- **Backend**: Serverless edge functions on Supabase (auto-scaling, pay-per-use)
- **No Database Required**: Stateless architecture with minimal data persistence
- **CDN-Optimized**: Fast global content delivery

---

## Tech Stack

### Frontend Technologies

#### Core Framework
- **React 18.3.1**
  - Modern functional components with hooks
  - Component-based architecture for reusability
  - Virtual DOM for efficient rendering

- **TypeScript 5.8.3**
  - Type safety across the entire codebase
  - Enhanced developer experience with IntelliSense
  - Reduced runtime errors through compile-time checking

#### Build Tool & Dev Server
- **Vite 5.4.19**
  - Lightning-fast development server (<100ms startup)
  - Instant Hot Module Replacement (HMR)
  - Optimized production builds using Rollup
  - Native ES modules support
  - Custom port: 8080

#### UI Framework & Styling
- **Tailwind CSS 3.4.17**
  - Utility-first CSS framework
  - Custom glass morphism design system
  - Responsive breakpoints
  - Custom color palette (purple, blue, amber theme)

- **shadcn-ui**
  - Copy-paste component library (not a package dependency)
  - Built on Radix UI primitives (accessible, unstyled)
  - Fully customizable components
  - Components include: Button, Card, Dialog, Select, Toast, and more

- **Lucide React 0.462.0**
  - Comprehensive icon library
  - Tree-shakeable (only imports used icons)
  - Consistent design language

#### State Management & Data Fetching
- **TanStack React Query 5.83.0**
  - Server state management
  - Automatic caching and background updates
  - Request deduplication
  - Optimistic updates support

- **React Hooks (Built-in)**
  - useState for local component state
  - useEffect for side effects
  - useCallback for memoized functions
  - Custom hooks for reusable logic

#### Routing
- **React Router DOM 6.30.1**
  - Client-side routing
  - Declarative route definitions
  - Protected route support (ready for future features)

#### Forms & Validation
- **React Hook Form 7.61.1**
  - Performant form library
  - Minimal re-renders
  - Easy validation integration

- **Zod 3.25.76**
  - TypeScript-first schema validation
  - Runtime type checking
  - Composable schemas

- **@hookform/resolvers 3.10.0**
  - Integration between React Hook Form and Zod

#### Utilities
- **clsx & tailwind-merge**
  - Conditional class name utilities
  - Tailwind class merging and deduplication

- **class-variance-authority 0.7.1**
  - Component variant management
  - Type-safe variant definitions

---

### Backend Technologies

#### Serverless Runtime
- **Supabase Edge Functions**
  - **Runtime**: Deno 1.x
  - **Language**: TypeScript (native support)
  - **Deployment**: One-command deployment via Supabase CLI
  - **Scaling**: Automatic, handles traffic spikes
  - **Cost**: Pay-per-invocation model

#### Edge Functions Overview

1. **`analyze-image`**
   - Purpose: Analyze uploaded images using AI vision
   - Input: Base64-encoded image
   - Output: Mood, energy, genres, description, search terms, visual elements
   - External API: Gemini 2.5 Flash via Lovable AI Gateway

2. **`get-recommendations`**
   - Purpose: Search Spotify for tracks matching mood analysis
   - Input: Search terms, genres, mood, energy, visual elements
   - Output: Array of track recommendations (ID, name, artist, album art, preview URL)
   - External API: Spotify Web API

3. **`analyze-music`** (Music Mode feature)
   - Purpose: Analyze user's Spotify playlists/liked songs
   - Input: Spotify access token, playlist ID or "liked"
   - Output: Mood, energy, genres derived from audio features
   - External API: Spotify Web API (Audio Features endpoint)

4. **`spotify-auth`** (Music Mode feature)
   - Purpose: Handle Spotify OAuth flow
   - Input: Authorization code
   - Output: Access token, refresh token
   - External API: Spotify OAuth endpoints

---

### External Services & APIs

#### AI/ML Services
- **Google Gemini 2.5 Flash**
  - Provider: Via Lovable AI Gateway
  - Use Case: Image analysis and mood extraction
  - Capabilities:
    - Visual content understanding
    - Emotion recognition
    - Context extraction (setting, colors, atmosphere)
    - Multi-modal understanding (text + image)

#### Music Services
- **Spotify Web API**
  - Authentication: OAuth 2.0 (Authorization Code Flow)
  - Endpoints Used:
    - Search API (track discovery)
    - Audio Features API (mood analysis)
    - User Library API (liked songs)
    - Playlists API (playlist access)
    - User Profile API (user info)
  - Features:
    - 30-second track previews
    - Album artwork
    - Track metadata
    - Direct streaming links

#### Infrastructure
- **Supabase**
  - Backend-as-a-Service (BaaS)
  - Edge Functions hosting
  - Environment variable management
  - Built-in CORS handling

---

### Development Tools

#### Code Quality
- **ESLint 9.32.0**
  - Code linting and style enforcement
  - React-specific rules
  - TypeScript support

- **TypeScript ESLint 8.38.0**
  - TypeScript-aware linting
  - Advanced type checking rules

#### Development Experience
- **Lovable Tagger 1.1.13**
  - AI-assisted development integration
  - Component tagging for better AI understanding
  - Development mode only

#### Build Tools
- **PostCSS 8.5.6**
  - CSS processing
  - Autoprefixer integration

- **Autoprefixer 10.4.21**
  - Automatic vendor prefixing
  - Browser compatibility

---

## Application Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                    # shadcn-ui base components
│   ├── PhotoUpload.tsx        # Image upload with drag & drop
│   ├── LoadingState.tsx       # Loading animations
│   ├── MoodDisplay.tsx        # Mood analysis visualization
│   ├── SongCard.tsx           # Track card with audio player
│   ├── ShareButtons.tsx       # Social media sharing
│   ├── RegenerateButton.tsx   # Regenerate recommendations
│   ├── SpotifyAuth.tsx        # Spotify OAuth integration
│   ├── VibeModeToggle.tsx     # Photo/Music mode switcher
│   └── PlaylistSelector.tsx   # Spotify playlist selector
├── pages/
│   ├── Index.tsx              # Main application page
│   └── NotFound.tsx           # 404 error page
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client configuration
│       └── types.ts           # TypeScript type definitions
├── App.tsx                    # Root component with routing
└── main.tsx                   # Application entry point
```

### Data Flow

#### Photo Mode Flow
1. User uploads image → `PhotoUpload` component
2. Image converted to base64 → Sent to `analyze-image` edge function
3. Gemini analyzes image → Returns mood, energy, genres, search terms
4. Analysis sent to `get-recommendations` edge function
5. Multiple Spotify searches executed → Results combined and deduplicated
6. Top 5 tracks returned → Displayed in `SongCard` components
7. User can preview, share, or regenerate

#### Music Mode Flow
1. User connects Spotify → OAuth flow via `spotify-auth` edge function
2. User selects playlist/liked songs → `PlaylistSelector` component
3. Selection sent to `analyze-music` edge function
4. Spotify Audio Features API analyzes tracks → Mood/energy extracted
5. Analysis sent to `get-recommendations` → Similar music discovered
6. Recommendations displayed to user

---

## Design System

### Color Palette

- **Primary Color**: Purple (`hsl(270, 80%, 60%)`)
  - Main brand color
  - Interactive elements
  - Accent highlights

- **Secondary Color**: Electric Blue (`hsl(200, 80%, 50%)`)
  - Supporting accents
  - Information displays

- **Accent Color**: Warm Amber (`hsl(35, 90%, 55%)`)
  - Highlights
  - Energy indicators

- **Background**: Dark (`hsl(240, 10%, 4%)`)
  - Base background
  - Card backgrounds with transparency

- **Glass Morphism Effect**:
  - Semi-transparent cards (`bg-card/60`)
  - Backdrop blur (`backdrop-blur-xl`)
  - Subtle borders (`border-border/50`)
  - Layered shadows

### Typography

- **Display Font**: Space Grotesk
  - Headings (h1, h2, h3)
  - Brand elements
  - Large text emphasis

- **Body Font**: Inter
  - Body text
  - UI elements
  - Descriptions

### Animation System

- **Fade-in-up**: Content entry animations
- **Waveform**: Audio visualization during playback
- **Spin-slow**: Album art rotation when playing
- **Pulse-glow**: Interactive element feedback
- **Transition**: Smooth state changes (300ms default)

---

## Key Features

### 1. Dual Analysis Modes

**Photo Mode** (Default)
- Upload any image (JPG, PNG, WEBP)
- AI analyzes visual content
- Extracts: mood, energy, genres, visual elements
- Generates Spotify-optimized search terms
- Returns personalized music recommendations

**Music Mode**
- Connect Spotify account (OAuth 2.0)
- Select from playlists or liked songs
- Analyzes audio features (energy, valence, tempo, etc.)
- Derives musical preferences
- Discovers similar tracks

### 2. Intelligent Music Discovery

- **Multi-Strategy Search**: Uses 6+ different search strategies in parallel
- **Fallback Mechanisms**: Ensures results even if primary search fails
- **Deduplication**: Removes duplicate tracks across searches
- **Priority Ranking**: Prioritizes Gemini-optimized search terms

### 3. Rich User Experience

- **Audio Previews**: 30-second Spotify track previews
- **Visual Feedback**: Waveform animations during playback
- **Social Sharing**: Share to Instagram, TikTok, Twitter, or copy links
- **Regeneration**: Get new recommendations with same input
- **Responsive Design**: Works on mobile, tablet, and desktop

### 4. Modern UI/UX

- **Glass Morphism**: Modern, elegant design aesthetic
- **Smooth Animations**: Polished transitions and interactions
- **Loading States**: Clear feedback during processing
- **Error Handling**: User-friendly error messages
- **Accessibility**: Built on accessible UI primitives (Radix UI)

---

## Technical Highlights

### Performance Optimizations

1. **Code Splitting**: Route-based lazy loading (ready for implementation)
2. **Image Optimization**: Client-side base64 conversion (no server processing)
3. **Memoization**: useCallback and useMemo for expensive operations
4. **Query Caching**: TanStack Query caches API responses
5. **Build Optimization**: Vite production builds are tree-shaken and minified

### Security Features

1. **OAuth 2.0**: Secure Spotify authentication with state parameter (CSRF protection)
2. **Environment Variables**: Secrets stored securely in Supabase
3. **CORS Configuration**: Properly configured for edge functions
4. **Token Management**: Secure token storage with expiry handling
5. **Input Validation**: Zod schemas validate API inputs

### Scalability

1. **Serverless Architecture**: Auto-scales with traffic
2. **Stateless Design**: No database dependencies
3. **CDN Delivery**: Static assets served via CDN
4. **Edge Functions**: Low-latency global distribution
5. **External APIs**: Leverages scalable third-party services

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:8080

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Deployment

**Frontend**:
- Deploy static build to Vercel, Netlify, or Supabase Hosting
- Environment variables configured in hosting platform

**Backend**:
```bash
# Deploy edge functions
supabase functions deploy analyze-image
supabase functions deploy get-recommendations
supabase functions deploy analyze-music
supabase functions deploy spotify-auth
```

### Environment Configuration

**Required Environment Variables**:

Frontend (`.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SPOTIFY_CLIENT_ID` (optional, for Music Mode)

Backend (Supabase Dashboard):
- `LOVABLE_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`

---

## Future Enhancements

### Potential Features
- **Playlist Creation**: Auto-generate Spotify playlists from recommendations
- **History Tracking**: Save favorite recommendations
- **Advanced Filters**: Filter by decade, popularity, explicit content
- **Batch Processing**: Analyze multiple images at once
- **Video Support**: Analyze video frames for music recommendations
- **Collaborative Features**: Share playlists with friends
- **Machine Learning**: Personalized recommendation models based on user preferences

### Technical Improvements
- **Refresh Token Management**: Auto-refresh expired Spotify tokens
- **Rate Limiting**: Implement rate limiting for API calls
- **Caching Strategy**: Cache common searches/results
- **Analytics**: User behavior tracking and insights
- **A/B Testing**: Test different recommendation algorithms
- **Progressive Web App**: Offline support and app-like experience

---

## Conclusion

TuneStory represents a modern approach to music discovery, leveraging cutting-edge AI technology and a robust, scalable architecture. The application demonstrates best practices in:

- **Modern Web Development**: React, TypeScript, and modern build tools
- **Serverless Architecture**: Scalable, cost-effective backend
- **AI Integration**: Seamless use of vision models for content analysis
- **API Integration**: Sophisticated OAuth and API usage patterns
- **User Experience**: Polished UI with attention to detail

The tech stack is production-ready, maintainable, and designed for future growth and feature expansion.

---

## Contact & Resources

- **Repository**: [GitHub](https://github.com/Tylarcam/tunestory-vibes)
- **Documentation**: See README.md for setup instructions
- **Tech Stack Guide**: See TECH_STACK_GUIDE.md for detailed technical documentation

---

*Last Updated: 2024*

