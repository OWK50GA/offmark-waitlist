# Visual QA Checklist

## Figma to Code Comparison

### Design Fidelity Checklist

#### Colors ✅
- [x] Background: `#100e0e` (Dark)
- [x] Primary Orange: `#f05a25`
- [x] Text White: `#ffffff`
- [x] Text Gray: `#dcdcdc`
- [x] Blur effects: `rgba(240,90,37,0.29)`

#### Typography ✅
- [x] Font Family: Poppins
- [x] Font Weights: Regular (400), Medium (500), SemiBold (600)
- [x] Hero Title: 96px (desktop), 48px (mobile)
- [x] Body Text: 24px
- [x] "Coming soon" badge: 24px

#### Layout ✅
- [x] Hero section with backdrop blur
- [x] Centered content layout
- [x] Email input form with rounded corners
- [x] "Join Waitlist" button styling
- [x] Phone mockup positioning
- [x] Feature cards grid

#### Components ✅
- [x] Logo in top-left corner
- [x] "Coming soon" pill badge
- [x] Email input field
- [x] Submit button with hover state
- [x] Phone mockup with screen content
- [x] Feature showcase cards
- [x] Background gradients and overlays

#### Responsive Design ✅
- [x] Mobile-friendly layout
- [x] Responsive typography
- [x] Flexible grid for feature cards
- [x] Hidden phone mockup on mobile

#### Interactive Elements ✅
- [x] Form submission handling
- [x] Loading state on submit
- [x] Success/error messages
- [x] Button hover effects
- [x] Input focus states

### Exported Assets ✅

All assets exported from Figma and stored in `public/assets/figma/`:

- [x] `rectangle-164.png` - Hero background
- [x] `rectangle-167.png` - Bottom gradient
- [x] `rectangle-168.png` - Feature images
- [x] `rectangle-169.png` - Marketplace preview
- [x] `rectangle-170.png` - Creator space preview
- [x] `rectangle-182.png` - Top header gradient
- [x] `frame-114x7.png` - OffMark logo
- [x] `image-1.png` - Phone screen content
- [x] `lens.png` - Camera lens detail
- [x] `lens-1.png` - Camera lens detail

### Known Differences

#### Intentional Changes
1. **Form Functionality**: Added real form submission logic (not in Figma)
2. **Loading States**: Added loading indicator during submission
3. **Error Handling**: Added error message display
4. **Responsive Breakpoints**: Adjusted for better mobile experience

#### Technical Limitations
1. **Blur Effects**: May render slightly differently across browsers
2. **Font Rendering**: May vary slightly based on OS/browser
3. **Image Quality**: Compressed for web performance

### Testing Checklist

#### Desktop (1440px+)
- [ ] Hero section displays correctly
- [ ] Email form is centered and sized properly
- [ ] Phone mockup is visible and positioned correctly
- [ ] Feature cards display in grid layout
- [ ] All images load correctly
- [ ] Blur effects render properly

#### Tablet (768px - 1439px)
- [ ] Layout adjusts appropriately
- [ ] Text remains readable
- [ ] Feature cards stack correctly
- [ ] Phone mockup hidden or adjusted

#### Mobile (< 768px)
- [ ] Single column layout
- [ ] Text sizes adjusted
- [ ] Form remains usable
- [ ] All content accessible

#### Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Performance Checklist

- [x] Images optimized with Next.js Image component
- [x] Fonts loaded from Google Fonts CDN
- [x] CSS optimized with Tailwind
- [x] No console errors
- [x] Fast initial load time

### Accessibility Checklist

- [x] Semantic HTML elements
- [x] Alt text for images
- [x] Form labels (implicit via placeholder)
- [x] Keyboard navigation support
- [x] Focus states visible
- [ ] Screen reader testing (pending)
- [ ] Color contrast validation (pending)

## Visual Comparison Steps

1. **Open Figma Design**:
   https://www.figma.com/design/UX8bNNTDKBkBfepCC0uX0Y/offmark?node-id=366-558

2. **Open Local Development**:
   http://localhost:3000

3. **Compare Side-by-Side**:
   - Use browser dev tools to measure spacing
   - Compare colors using color picker
   - Verify font sizes and weights
   - Check alignment and positioning

4. **Test Interactions**:
   - Hover states
   - Form submission
   - Responsive behavior
   - Loading states

## Sign-off

- [ ] Design approved by designer
- [ ] Functionality tested
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Ready for production

## Notes

Add any additional notes or observations here.
