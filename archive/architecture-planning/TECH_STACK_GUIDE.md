# Tech Stack & Architecture Guide
## Lovable + Vite + React + TypeScript + Supabase

This document breaks down the core technology stack and architecture used in this project. Use this as a reference when building similar applications or priming an agentic development environment.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Client)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Vite Dev Server (localhost:8080)                 │  │
│  │  - React 18 + TypeScript                          │  │
│  │  - shadcn-ui Components                           │  │
│  │  - Tailwind CSS                                   │  │
│  │  - React Router (routing)                         │  │
│  │  - TanStack Query (data fetching)                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│              Backend (Supabase Edge Functions)          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Deno Runtime                                     │  │
│  │  - Edge Functions (serverless)                    │  │
│  │  - TypeScript                                     │  │
│  │  - External API integrations                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ API Calls
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│  - OpenAI / Gemini (AI/ML)                             │
│  - Spotify API                                         │
│  - Other third-party APIs                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Technologies

### 1. **Vite** (Build Tool & Dev Server)

**What it is:** Next-generation frontend build tool that provides fast hot module replacement (HMR) and optimized production builds.

**Key Features:**
- ⚡ Lightning-fast dev server with instant HMR
- 📦 Optimized production builds using Rollup
- 🔧 Plugin ecosystem (React, TypeScript, etc.)
- 🎯 Native ES modules support

**Configuration (`vite.config.ts`):**
```typescript
export default defineConfig({
  server: {
    host: "::",        // Listen on all network interfaces
    port: 8080,        // Custom port
  },
  plugins: [
    react(),           // React plugin with SWC (faster than Babel)
    componentTagger()  // Lovable plugin (dev mode only)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")  // Path aliases
    }
  }
});
```

**Why Vite over Create React App/Webpack:**
- Much faster dev server startup
- Instant HMR (no full page reload)
- Smaller bundle sizes
- Better TypeScript support

---

### 2. **React 18** (UI Framework)

**What it is:** Component-based JavaScript library for building user interfaces.

**Key Features Used:**
- Functional components with hooks
- TypeScript for type safety
- React Router for navigation
- TanStack Query for server state

**File Structure:**
```
src/
├── components/     # Reusable UI components
├── pages/          # Route/page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── integrations/   # Third-party integrations (Supabase, etc.)
├── App.tsx         # Root component with routing
└── main.tsx        # Entry point
```

**Component Pattern:**
```typescript
// Typical component structure
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";  // Path alias

export function MyComponent() {
  const [state, setState] = useState<string>("");
  
  const handleClick = useCallback(() => {
    // Handler logic
  }, []);
  
  return <Button onClick={handleClick}>Click me</Button>;
}
```

---

### 3. **TypeScript** (Type Safety)

**What it is:** Typed superset of JavaScript that compiles to plain JavaScript.

**Configuration:**
- `tsconfig.json` - Base config
- `tsconfig.app.json` - App-specific config
- `tsconfig.node.json` - Node/build tool config

**Key Settings:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]  // Path aliases for imports
    },
    "strictNullChecks": false,  // Relaxed for faster development
    "noImplicitAny": false
  }
}
```

**Type Patterns:**
```typescript
// Props interfaces
interface ComponentProps {
  title: string;
  count?: number;  // Optional
  onAction: (id: string) => void;
}

// Type exports
export type AppState = "loading" | "success" | "error";

// Generic types
const [items, setItems] = useState<Item[]>([]);
```

---

### 4. **Supabase** (Backend-as-a-Service)

**What it is:** Open-source Firebase alternative providing database, authentication, storage, and edge functions.

**Architecture:**
```
Supabase Project
├── Database (PostgreSQL)
├── Authentication
├── Storage
└── Edge Functions (Deno runtime)
    ├── analyze-image/
    ├── get-recommendations/
    └── spotify-auth/
```

#### **Supabase Client (Frontend)**
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

#### **Edge Functions (Backend)**
- **Runtime:** Deno (secure TypeScript runtime)
- **Location:** `supabase/functions/function-name/index.ts`
- **Deployment:** `supabase functions deploy function-name`
- **Environment:** Secrets stored in Supabase dashboard

**Edge Function Pattern:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    
    // Business logic here
    const result = await processData(data);
    
    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**Why Supabase Edge Functions:**
- Serverless (no server management)
- Deno runtime (secure, modern)
- Easy deployment
- Built-in CORS handling
- Environment variable management

---

### 5. **shadcn-ui** (Component Library)

**What it is:** Not a traditional component library. It's a collection of copy-paste components built on Radix UI primitives and styled with Tailwind CSS.

**Key Concepts:**
- **Copy, don't install:** Components are copied into your project
- **Radix UI primitives:** Accessible, unstyled components
- **Tailwind CSS:** Utility-first styling
- **Fully customizable:** Since code is in your project

**Structure:**
```
src/components/ui/      # shadcn-ui components (copied here)
├── button.tsx
├── card.tsx
├── dialog.tsx
└── ...
```

**Usage:**
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// Components are fully typed and customizable
<Button variant="outline" size="lg">Click me</Button>
```

**Configuration (`components.json`):**
```json
{
  "style": "default",
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Adding Components:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

---

### 6. **Tailwind CSS** (Styling)

**What it is:** Utility-first CSS framework for rapid UI development.

**Key Features:**
- Utility classes (e.g., `flex`, `p-4`, `text-primary`)
- Custom theme configuration
- CSS variables for theming
- JIT (Just-In-Time) compilation

**Configuration (`tailwind.config.ts`):**
```typescript
export default {
  content: ["./src/**/*.{ts,tsx}"],  // Files to scan for classes
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",  // CSS variable
        // ... custom colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      }
    }
  }
}
```

**CSS Variables (`src/index.css`):**
```css
@layer base {
  :root {
    --primary: 270 80% 60%;        /* HSL values */
    --background: 240 10% 4%;
    --foreground: 0 0% 95%;
  }
}

@layer components {
  .glass-card {
    @apply bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl;
  }
}
```

**Usage Patterns:**
```typescript
// Utility classes
<div className="flex items-center gap-4 p-6 rounded-xl bg-primary/20">

// Conditional classes
import { cn } from "@/lib/utils";  // clsx + tailwind-merge
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "large" && "large-classes"
)}>
```

---

### 7. **Lovable Dev Environment**

**What is Lovable?** An AI-powered development platform that integrates with your codebase.

#### **Lovable Integration**

**Component Tagger (`lovable-tagger`):**
```typescript
// vite.config.ts
import { componentTagger } from "lovable-tagger";

plugins: [
  react(),
  mode === "development" && componentTagger()  // Dev mode only
].filter(Boolean)
```

**What it does:**
- Adds metadata tags to React components in development
- Helps AI understand component structure
- Enables AI to suggest/edit components intelligently
- Only runs in development mode (removed in production builds)

#### **Lovable Architecture Philosophy**

1. **Component-Based Development:**
   - Build reusable, composable components
   - Clear component boundaries
   - Props-based communication

2. **Type Safety:**
   - TypeScript throughout
   - Explicit types for props, state, API responses

3. **Path Aliases:**
   - Clean imports: `@/components/ui/button`
   - Configured in `tsconfig.json` and `vite.config.ts`

4. **Convention over Configuration:**
   - Standard folder structure
   - Consistent naming patterns
   - Predictable file locations

#### **Lovable Project Structure:**
```
project-root/
├── src/
│   ├── components/          # All reusable components
│   │   ├── ui/             # shadcn-ui components
│   │   └── feature/        # Feature-specific components
│   ├── pages/              # Route components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities, helpers
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── supabase/
│   └── functions/          # Edge functions
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## 🔄 Data Flow Patterns

### Frontend → Backend

```typescript
// 1. Component triggers action
const handleSubmit = async () => {
  setLoading(true);
  
  // 2. Call edge function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/function-name`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ data }),
    }
  );
  
  // 3. Handle response
  const result = await response.json();
  setData(result);
};
```

### State Management

**Local State (useState):**
```typescript
const [count, setCount] = useState<number>(0);
```

**Server State (TanStack Query):**
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["items"],
  queryFn: async () => {
    const response = await fetch("/api/items");
    return response.json();
  }
});
```

---

## 🛠️ Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens http://localhost:8080
```

### Adding Components

```bash
# Add shadcn-ui component
npx shadcn-ui@latest add button

# Create custom component
# Create file: src/components/MyComponent.tsx
```

### Deploying Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy function-name
```

### Building for Production

```bash
# Build
npm run build
# → Creates optimized files in dist/

# Preview production build
npm run preview
```

---

## 📦 Key Dependencies Explained

### Core Framework
- **react** (^18.3.1) - UI library
- **react-dom** (^18.3.1) - React DOM renderer
- **react-router-dom** (^6.30.1) - Client-side routing

### UI & Styling
- **@radix-ui/*** - Headless UI primitives (used by shadcn-ui)
- **tailwindcss** (^3.4.17) - Utility-first CSS
- **lucide-react** (^0.462.0) - Icon library
- **class-variance-authority** (^0.7.1) - Component variants
- **clsx** + **tailwind-merge** - Class name utilities

### Data & State
- **@tanstack/react-query** (^5.83.0) - Server state management
- **@supabase/supabase-js** (^2.88.0) - Supabase client

### Forms & Validation
- **react-hook-form** (^7.61.1) - Form state management
- **zod** (^3.25.76) - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Build Tools
- **vite** (^5.4.19) - Build tool
- **@vitejs/plugin-react-swc** - React plugin with SWC
- **typescript** (^5.8.3) - TypeScript compiler
- **lovable-tagger** (^1.1.13) - Lovable integration

---

## 🔐 Environment Variables

### Frontend (.env)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Third-party APIs (if used in frontend)
VITE_SPOTIFY_CLIENT_ID=your-client-id  # Public OK
```

**Rules:**
- Must prefix with `VITE_` to be accessible in frontend
- Can expose public keys (Client IDs)
- **NEVER** expose secrets (Client Secrets, API Keys)

### Backend (Supabase Edge Functions)
Set in Supabase Dashboard → Edge Functions → Settings

```bash
# Secrets (private)
SPOTIFY_CLIENT_SECRET=secret-value
OPENAI_API_KEY=secret-value
LOVABLE_API_KEY=secret-value

# Public config
SPOTIFY_CLIENT_ID=public-value
SPOTIFY_REDIRECT_URI=https://your-app.com
```

---

## 🎨 Styling Patterns

### Glass Morphism
```css
.glass-card {
  @apply bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Custom Animations
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
```

### Theme Colors (CSS Variables)
```css
:root {
  --primary: 270 80% 60%;      /* HSL format */
  --secondary: 200 80% 50%;
  --background: 240 10% 4%;
}

/* Usage in Tailwind */
bg-primary  /* Uses --primary */
text-primary-foreground
```

---

## 🚀 Creating a Similar Project

### 1. Initialize Project
```bash
# Create Vite + React + TypeScript project
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### 2. Install Core Dependencies
```bash
# UI & Styling
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install clsx tailwind-merge class-variance-authority

# Routing & State
npm install react-router-dom
npm install @tanstack/react-query

# Backend
npm install @supabase/supabase-js

# Forms
npm install react-hook-form zod @hookform/resolvers

# Lovable (optional)
npm install -D lovable-tagger
```

### 3. Setup Tailwind
```bash
npx tailwindcss init -p
```

### 4. Setup shadcn-ui
```bash
npx shadcn-ui@latest init
```

### 5. Configure Vite
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 6. Setup TypeScript Paths
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📚 Key Concepts to Understand

### 1. **Path Aliases (`@/`)**
Instead of `../../../components/button`, use `@/components/button`
- Configured in `tsconfig.json` (TypeScript)
- Configured in `vite.config.ts` (Vite)
- Makes imports cleaner and refactoring easier

### 2. **CSS Variables for Theming**
Use HSL values in CSS variables, access via Tailwind:
```css
--primary: 270 80% 60%;
```
```typescript
className="bg-primary"  // Uses the CSS variable
```

### 3. **Serverless Functions**
Supabase Edge Functions are serverless:
- No server to manage
- Auto-scaling
- Pay per invocation
- Deno runtime (secure, modern)

### 4. **Component Composition**
Build complex UIs by composing simple components:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### 5. **Type Safety Everywhere**
- Type component props
- Type API responses
- Type state variables
- Type function parameters/returns

---

## 🔍 Common Patterns

### API Calls with Error Handling
```typescript
try {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  
  return await response.json();
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
  throw error;
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};
```

### Form Handling
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

---

## 🎯 Best Practices

1. **Component Organization**
   - Keep components small and focused
   - One component per file
   - Use TypeScript interfaces for props

2. **State Management**
   - Use `useState` for local UI state
   - Use TanStack Query for server state
   - Lift state only when necessary

3. **Styling**
   - Prefer Tailwind utilities over custom CSS
   - Use CSS variables for theme colors
   - Create reusable component classes in `@layer components`

4. **Error Handling**
   - Always handle errors in async operations
   - Show user-friendly error messages
   - Log errors for debugging

5. **Performance**
   - Use `useCallback` for event handlers passed to children
   - Use `useMemo` for expensive computations
   - Lazy load routes with `React.lazy()`

---

## 📖 Additional Resources

- **Vite:** https://vitejs.dev
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Supabase:** https://supabase.com/docs
- **shadcn-ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **TanStack Query:** https://tanstack.com/query
- **Lovable:** https://lovable.dev/docs

---

## 🎓 Learning Path

1. **Start with basics:**
   - React hooks (useState, useEffect, useCallback)
   - TypeScript basics (types, interfaces, generics)
   - Tailwind CSS utilities

2. **Move to advanced:**
   - React Router (routing, navigation)
   - TanStack Query (data fetching, caching)
   - Form handling with react-hook-form

3. **Master the stack:**
   - Supabase Edge Functions
   - Component composition patterns
   - Performance optimization

4. **Explore Lovable:**
   - Understanding component tagging
   - Working with AI suggestions
   - Best practices for AI-assisted development

---

This stack provides a modern, type-safe, and scalable foundation for building web applications with excellent developer experience and production-ready performance.

