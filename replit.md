# ThinkSpeak Blogging Platform

## Overview

ThinkSpeak is a modern full-stack blogging platform built with React, Express.js, and PostgreSQL. The application features a responsive frontend for blog readers and a comprehensive admin dashboard for content management. The platform is designed to be scalable, secure, and user-friendly.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Theme Support**: Light/dark mode with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with in-memory storage
- **API Design**: RESTful API with JSON responses

### Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/          # Express backend
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Database interface
│   └── vite.ts      # Development server setup
├── shared/          # Shared types and schemas
└── migrations/      # Database migrations
```

## Key Components

### Database Schema
- **Users**: Admin authentication and user management
- **Categories**: Blog post categorization
- **Tags**: Flexible tagging system with many-to-many relationship
- **Posts**: Main blog content with rich metadata
- **Comments**: User comments with moderation support

### Frontend Components
- **BlogCard**: Responsive blog post preview cards
- **Navigation**: Sticky header with theme toggle
- **AdminSidebar**: Dashboard navigation for admin users
- **CommentForm**: User comment submission
- **CommentList**: Display approved comments

### Backend Services
- **Storage Interface**: Abstract database operations
- **Route Handlers**: RESTful API endpoints
- **Authentication Middleware**: Session management and authorization
- **Error Handling**: Centralized error processing

## Data Flow

### Public Blog Flow
1. User visits homepage → Fetch published posts from API
2. User clicks post → Navigate to post detail page
3. Post page loads → Fetch post content and approved comments
4. User submits comment → POST to comments API with pending status

### Admin Dashboard Flow
1. Admin login → Authentication via credentials
2. Session created → Access to protected admin routes
3. Admin actions → CRUD operations on posts, categories, comments
4. Real-time updates → Query invalidation triggers UI refresh

### Content Management Flow
1. Admin creates post → Draft status by default
2. Admin publishes post → Status changes to "published"
3. Comments submitted → Require admin approval
4. Admin moderates → Approve/reject comments

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **wouter**: Lightweight React router
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **eslint**: Code linting (implied by project structure)

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Database**: Neon PostgreSQL serverless database
- **Environment**: NODE_ENV=development with tsx for TypeScript execution

### Production Build
- **Frontend**: Vite build outputs to dist/public
- **Backend**: esbuild bundles server code to dist/index.js
- **Database**: Drizzle migrations applied via drizzle-kit push
- **Deployment**: Single process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Session Management**: In-memory sessions (suitable for single-instance deployment)
- **Static Assets**: Express serves built React app in production

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```