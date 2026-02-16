# OffMark Waitlist Frontend

This is the frontend application for the OffMark waitlist, built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- Responsive waitlist landing page
- Email submission form
- Integration with backend API
- Figma design implementation with pixel-perfect accuracy
- Modern UI with blur effects and animations

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Poppins Font** - Custom Google Font

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on port 3001 (see `packages/backend`)

### Installation

```bash
# Install dependencies (from root)
npm install

# Or install only frontend dependencies
cd packages/frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the `packages/frontend` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Development

```bash
# From root directory
npm run dev:frontend

# Or from packages/frontend
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build

```bash
# From root directory
npm run build

# Or from packages/frontend
npm run build
```

### Production

```bash
npm run start
```

## Project Structure

```
packages/frontend/
├── public/
│   └── assets/
│       └── figma/          # Exported Figma assets
├── src/
│   └── app/
│       ├── globals.css     # Global styles
│       ├── layout.tsx      # Root layout
│       └── page.tsx        # Waitlist page
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Design System

The design follows the Figma specifications with:

- **Primary Color**: `#f05a25` (Orange)
- **Background**: `#100e0e` (Dark)
- **Text**: `#ffffff` (White), `#dcdcdc` (Light Gray)
- **Font**: Poppins (Regular, Medium, SemiBold)

## API Integration

The frontend connects to the backend API at `/api/waitlist` endpoint:

- **Method**: POST
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Success or error message

## Exported Assets

All Figma assets are stored in `public/assets/figma/`:
- Background images
- Logo
- Phone mockup images
- Feature preview images

Assets are valid for 7 days from export and are served via Next.js Image optimization.

## Development Notes

- Uses Next.js App Router (not Pages Router)
- Client-side form handling with React hooks
- Responsive design with Tailwind breakpoints
- Image optimization with next/image
- CORS configured for localhost:3000

## Troubleshooting

### Images not loading
- Ensure backend API is running
- Check that image URLs in `next.config.ts` are correct
- Verify assets exist in `public/assets/figma/`

### API connection failed
- Ensure backend is running on port 3001
- Check CORS configuration in backend
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Build errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## License

Private - OffMark Project
