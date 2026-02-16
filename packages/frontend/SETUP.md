# Frontend Setup Guide

## Quick Start

1. **Install dependencies** (from project root):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev:frontend
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## With Backend Integration

To test the full waitlist functionality:

1. **Start the backend** (requires PostgreSQL):
   ```bash
   # In a separate terminal
   npm run dev:backend
   ```

2. **Start the frontend**:
   ```bash
   npm run dev:frontend
   ```

3. **Test the form**:
   - Enter an email address
   - Click "Join Waitlist"
   - You should see a success message

## Without Backend (Frontend Only)

The frontend will work without the backend, but form submissions will fail. You'll see an error message when trying to submit.

## Viewing the Design

The frontend implements the Figma design with:
- Hero section with email capture form
- Animated blur effects
- Phone mockup preview
- Feature showcase section
- Responsive layout

## Comparing with Figma

To compare the implementation with the original Figma design:

1. Open the Figma link: https://www.figma.com/design/UX8bNNTDKBkBfepCC0uX0Y/offmark?node-id=366-558
2. Open the frontend: http://localhost:3000
3. Compare visual elements, spacing, colors, and typography

## Key Features Implemented

✅ Exact color matching from Figma
✅ Poppins font family
✅ Responsive email input form
✅ "Join Waitlist" button with hover effects
✅ Phone mockup with app preview
✅ Feature cards with blur effects
✅ Background gradients and overlays
✅ Logo and branding elements

## Next Steps

- Connect to backend API for email submissions
- Add form validation
- Add loading states
- Add success/error animations
- Implement analytics tracking
- Add SEO optimization
- Test on mobile devices
