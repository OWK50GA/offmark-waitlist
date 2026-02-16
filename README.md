# OffMark Waitlist Application

A full-stack waitlist application for OffMark, featuring a Next.js frontend and Express backend.

## Project Structure

```
offmark_waitlist/
├── packages/
│   ├── backend/          # Express API server
│   └── frontend/         # Next.js application
├── .kiro/                # Kiro configuration
├── package.json          # Root package.json (workspace)
└── README.md            # This file
```

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **Poppins Font** - Custom typography

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type-safe API
- **PostgreSQL** - Database
- **Jest** - Testing framework

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (for backend)

### Installation

```bash
# Install all dependencies
npm install
```

### Development

#### Frontend Only
```bash
npm run dev:frontend
```
Visit [http://localhost:3000](http://localhost:3000)

#### Backend Only
```bash
# Ensure PostgreSQL is running
npm run dev:backend
```
API available at [http://localhost:3001](http://localhost:3001)

#### Both (Full Stack)
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

## Environment Setup

### Backend (.env)
```env
DATABASE_URL=postgresql://waitlist_user:waitlist_password@localhost:5432/waitlist_db
PORT=3001
NODE_ENV=development
JWT_SECRET=dev_jwt_secret_key_change_in_production
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Features

### Implemented
✅ Waitlist landing page (Figma design)
✅ Email capture form
✅ Backend API for email submissions
✅ PostgreSQL database integration
✅ CORS configuration
✅ TypeScript throughout
✅ Responsive design
✅ Property-based testing (backend)

### Planned
- Email validation improvements
- Success animations
- Analytics integration
- Email notifications
- Admin dashboard
- Rate limiting

## Design

The frontend is built from Figma designs with pixel-perfect accuracy:
- **Figma Link**: https://www.figma.com/design/UX8bNNTDKBkBfepCC0uX0Y/offmark?node-id=366-558
- **Design System**: See `.kiro/rules.mdc`

## Testing

```bash
# Backend tests
npm run test

# Frontend tests (when implemented)
cd packages/frontend && npm test
```

## Building for Production

```bash
# Build both packages
npm run build

# Start production servers
npm run start
```

## Documentation

- [Frontend README](packages/frontend/README.md)
- [Frontend Setup Guide](packages/frontend/SETUP.md)
- [Backend Specs](.kiro/specs/waitlist-email-backend/)

## Development Workflow

This project uses Kiro for spec-driven development:
1. Requirements defined in `.kiro/specs/`
2. Design documents with correctness properties
3. Task-based implementation
4. Property-based testing

## Contributing

1. Follow the design system rules in `.kiro/rules.mdc`
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow existing code patterns

## License

Private - OffMark Project
