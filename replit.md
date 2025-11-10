# RanaxHack Info App

## Overview

RanaxHack Info App is a cyberpunk-themed, single-page information lookup application that provides secure access to various data retrieval services. The application features a dark, hacker-aesthetic interface inspired by terminal environments and cyberpunk game UIs. It offers lookup capabilities for phone numbers, Aadhaar cards, Telegram accounts, Instagram profiles, and UPI information through external API integrations.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, designed to run on Replit with minimal configuration requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for fast refresh and optimized production builds
- Wouter for lightweight client-side routing (though the app is primarily single-page)
- TanStack React Query for server state management and API data caching

**UI Component System:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with extensive customization
- Custom design system implementing cyberpunk/hacker aesthetic with neon green accents (#00ff00) on dark backgrounds (#000000, #0a0a0a)
- Monospace typography using JetBrains Mono, Fira Code, or Source Code Pro
- Component variants managed through class-variance-authority

**Design Philosophy:**
- Dark mode by default with high-contrast neon elements
- Terminal-inspired interface with scanline effects
- Expandable/collapsible information sections for clean organization
- Responsive design with mobile breakpoint at 768px
- Single-page layout with vertically stacked sections

**State Management:**
- React Query handles all server state and API caching
- Local component state via React hooks for UI interactions
- No global state management library required

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- Custom Vite middleware integration for development
- Session-based request logging with response capture

**API Design Pattern:**
- RESTful proxy endpoints that forward requests to external services
- Input validation using regex patterns before external API calls
- Centralized error handling with descriptive error messages
- Endpoint pattern: `/api/{service-name}/{parameter}`

**Current API Endpoints:**
1. `/api/number-info/:phoneNumber` - Phone number lookup (10-digit validation)
2. `/api/family-detail/:aadhaar` - Aadhaar family details (12-digit validation)
3. Placeholder routes for Telegram, Instagram, and UPI (to be implemented)

**Data Storage Strategy:**
- In-memory storage implementation (MemStorage class) for user data
- User schema defined with Drizzle ORM for future database migration
- Schema includes id (UUID), username, and password fields
- Current implementation does not persist data between restarts

### External Dependencies

**Third-Party APIs:**
- `https://numapi.anshapi.workers.dev` - Phone number information lookup service
- `https://addartofamily.vercel.app` - Aadhaar family detail retrieval service
- Additional integrations planned for Telegram, Instagram, and UPI services

**Database Preparation:**
- Drizzle ORM configured for PostgreSQL with Neon serverless driver
- Database schema defined in `shared/schema.ts`
- Migration system ready via drizzle-kit
- Connection requires DATABASE_URL environment variable
- Note: Database currently not actively used; application uses in-memory storage

**Build & Deployment:**
- esbuild bundles the server code for production
- Vite bundles the client application with code splitting
- Development mode runs tsx for server with hot reload
- Production serves static files from `dist/public`
- Vercel deployment support with serverless API functions in `/api` directory
- Vercel configuration in `vercel.json` with proper rewrites and output settings

**Replit-Specific Integrations:**
- Vite plugins for runtime error overlay
- Cartographer plugin for development visualization (dev only)
- Dev banner plugin for development environment indicators (dev only)

**UI Component Libraries:**
- Radix UI primitives (accordion, dialog, dropdown, tooltip, etc.)
- Embla Carousel for carousel functionality
- cmdk for command palette interface
- Lucide React for iconography
- date-fns for date manipulation

**Development Tools:**
- TypeScript strict mode for type safety
- PostCSS with Tailwind and Autoprefixer
- Path aliases configured: @/ for client src, @shared/ for shared code
- ESM module system throughout

## Deployment Options

### Replit Deployment
The application is configured to run on Replit with the "Start application" workflow that runs `npm run dev` on port 5000.

### Vercel Deployment
The application is ready for Vercel deployment with:
- **Configuration:** `vercel.json` for build and routing settings
- **Serverless API Functions:** 
  - `/api/number-info/[phoneNumber].ts` - Phone number lookup
  - `/api/family-detail/[aadhaar].ts` - Aadhaar lookup
- **Build Output:** Frontend builds to `dist/public` via Vite
- **Documentation:** See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions

The serverless functions replicate the Express API routes and maintain the same validation, error handling, and external API integration logic.