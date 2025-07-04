# Tesla Delivery Companion

## Overview

The Tesla Delivery Companion is a mobile-first web application designed to streamline the Tesla vehicle pre-delivery inspection process. Built with React/TypeScript frontend and Node.js/Express backend, it provides a comprehensive digital checklist for Tesla deliveries with photo capture, note-taking, signature collection, and automated report generation.

## System Architecture

### Frontend Architecture
- **React/TypeScript SPA**: Mobile-first responsive design using React with TypeScript
- **UI Framework**: Shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Node.js/Express**: RESTful API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Upload**: Multer for handling media uploads
- **External Integrations**: Tesla Fleet API, Google Drive API, SendGrid email service

### Data Storage
- **Primary Database**: PostgreSQL hosted on Neon (serverless PostgreSQL)
- **ORM**: Drizzle ORM with schema migrations
- **File Storage**: Google Drive API for media files and PDF reports
- **Local Storage**: Browser localStorage for offline functionality

## Key Components

### Database Schema
- **inspections**: Main inspection records with vehicle info, status, and checklist data
- **inspectionMedia**: Photos and videos linked to specific checklist items
- **inspectionReports**: Generated PDF reports with Drive links

### API Endpoints
- `POST /api/inspections`: Create new inspection
- `GET /api/inspections/:id`: Retrieve inspection by ID
- `PUT /api/inspections/:id`: Update inspection data
- `POST /api/inspections/:id/media`: Upload media files
- `POST /api/inspections/:id/report`: Generate PDF report

### External Services
- **Tesla Fleet API**: Vehicle and order information retrieval
- **Google Drive API**: Media and report file storage
- **SendGrid**: Email delivery for inspection reports

## Data Flow

1. User enters order number to start inspection
2. System fetches vehicle data from Tesla API
3. User completes checklist items with photos/notes
4. Media files uploaded to Google Drive via API
5. Inspection data saved to PostgreSQL database
6. User signs digital signature
7. PDF report generated and uploaded to Drive
8. Email sent to customer and sales rep with report

## External Dependencies

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `TESLA_API_KEY` or `TESLA_CLIENT_ID`: Tesla Fleet API credentials
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Drive service account email
- `GOOGLE_SERVICE_ACCOUNT_KEY`: Google Drive service account private key
- `GOOGLE_DRIVE_FOLDER_ID`: Target folder for file uploads
- `SENDGRID_API_KEY`: SendGrid API key for email delivery

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Drive API**: File storage and sharing
- **SendGrid**: Email delivery service
- **Tesla Fleet API**: Vehicle data integration

## Deployment Strategy

### Development
- `npm run dev`: Start development server with Vite HMR
- `npm run db:push`: Push database schema changes
- Local development uses Vite dev server with Express API

### Production
- `npm run build`: Build React app and bundle Express server
- `npm start`: Start production server
- Uses esbuild for server bundling and Vite for client build
- Designed for deployment on platforms like Railway, Render, or Vercel

### Database Migrations
- Drizzle Kit handles schema migrations
- `drizzle.config.ts` configures migration settings
- Schema defined in `shared/schema.ts` for type safety

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- July 04, 2025: Enhanced media evidence system for failed inspection items
  - Added support for up to 5 photos OR 1 video (max 2 minutes) per failed item
  - Implemented client-side and server-side validation for media limits
  - Enhanced MediaCapture component with photo/video mode selection
  - Added real-time recording timer and progress indicators
  - Implemented comprehensive file type, size, and duration validation
  - Updated InspectionItem UI to show evidence requirements and thumbnails
  - Added server-side validation to enforce 50MB file size and media count limits

## Changelog

- July 04, 2025: Initial project setup and comprehensive test suite creation