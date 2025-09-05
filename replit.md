# Overview

This is a full-stack web application for a pop-punk band called "Panickin' Skywalker" built as a modern React single-page application with an Express backend. The project is designed to create a professional band website with a music-first approach, featuring a dark theme with black and pink accent colors to match the band's punk aesthetic. The application includes functionality for showcasing music releases, band information, tour dates, and newsletter signup capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server for fast hot module replacement
- **Wouter** for client-side routing instead of React Router for a lighter footprint
- **TanStack Query** for server state management and API data fetching
- **Framer Motion** for smooth animations and scroll-triggered effects
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for utility-first styling with CSS variables for theming

## Backend Architecture  
- **Express.js** server with TypeScript for API endpoints
- **In-memory storage** using Map data structures as the current data persistence layer
- RESTful API design with proper error handling and request/response logging
- Newsletter signup endpoint with email validation using Zod schemas

## Database Architecture
- **Drizzle ORM** configured for PostgreSQL with schema definitions in TypeScript
- Database schema includes users table and newsletter_subscribers table
- **Neon Database** integration ready (using @neondatabase/serverless)
- Migration system configured with drizzle-kit

## Component Structure
- Modular component architecture with separate components for each page section (Hero, Music, Band, Tour, Contact, Footer)
- Reusable UI components from shadcn/ui library
- Custom styling with CSS variables for consistent theming
- Responsive design with mobile-first approach

## State Management
- TanStack Query for server state with proper caching strategies
- Local component state using React hooks for UI interactions
- Form handling with proper validation and error states

## Styling System
- Dark theme with black background and pink (#FF1581) accent colors
- CSS custom properties for consistent color theming
- Tailwind CSS with custom configuration for brand colors
- Typography using Inter font family for clean, modern appearance

# External Dependencies

## Core Framework Dependencies
- **React 18** - Frontend UI library with latest features
- **Express.js** - Node.js web framework for backend API
- **TypeScript** - Type safety across frontend and backend
- **Vite** - Build tool and development server

## Database & ORM
- **Drizzle ORM** - Type-safe SQL ORM for PostgreSQL
- **@neondatabase/serverless** - Serverless PostgreSQL database connection
- **pg** (PostgreSQL client) - Database connectivity

## UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** components built on **Radix UI** primitives
- **Framer Motion** - Animation library for smooth transitions
- **Lucide React** - Icon library for consistent iconography

## Data Fetching & Validation
- **TanStack React Query** - Server state management and data fetching
- **Zod** - Schema validation for API requests and responses
- **React Hook Form** with **@hookform/resolvers** - Form handling and validation

## Development & Build Tools
- **Vite** - Development server and build tooling
- **esbuild** - Fast JavaScript bundler for production builds
- **tsx** - TypeScript execution for development server
- **PostCSS** with **Autoprefixer** - CSS processing

## Social Integration
- **react-icons** - Social media icons (Spotify, Apple Music, YouTube, Instagram, TikTok, Discord)

## Utility Libraries
- **clsx** and **tailwind-merge** - Conditional CSS class utilities
- **date-fns** - Date manipulation and formatting
- **nanoid** - Unique ID generation
- **class-variance-authority** - Component variant management

The application is structured as a monorepo with shared schemas and types between frontend and backend, ensuring type safety across the full stack. The build system is optimized for both development and production deployments.