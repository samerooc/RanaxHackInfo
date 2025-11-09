# RanaxHack Info App - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from hacker/cyberpunk interfaces and terminal aesthetics found in applications like HackerRank, CodePen's dark mode, and cyberpunk game UIs.

## Core Design Principles
- **Dark Cyberpunk Aesthetic**: Create an immersive hacker/terminal environment
- **High Contrast**: Sharp neon accents against dark backgrounds for readability
- **Functional Minimalism**: Clean, organized layout prioritizing usability despite dramatic styling

## Color System
- **Primary Background**: Pure black (#000000) or near-black (#0a0a0a)
- **Secondary Background**: Dark gray (#1a1a1a) for cards/sections
- **Primary Accent**: Neon green (#00ff00, #0f0) for CTAs and highlights
- **Secondary Accent**: Dark green (#003300, #004d00) for borders and subtle elements
- **Alert/Error**: Bright red (#ff0000, #f00) for errors and warnings
- **Text Primary**: Neon green or bright cyan (#00ff00, #0ff)
- **Text Secondary**: Light gray (#a0a0a0) for labels

## Typography
- **Primary Font**: Monospace fonts like "Courier New", "Fira Code", "Source Code Pro", or "JetBrains Mono" via Google Fonts
- **Heading Sizes**: Use large, bold monospace for headers (2xl-4xl)
- **Body Text**: Medium size monospace for readability (base to lg)
- **Terminal Effect**: Consider adding subtle text-shadow glow effects on neon text

## Layout System
- **Spacing Units**: Use Tailwind units of 4, 6, 8, and 12 for consistent rhythm
- **Single-page Application**: All sections accessible without navigation, stacked vertically
- **Container Width**: max-w-6xl for main content, full-width dark backgrounds
- **Section Padding**: py-12 to py-16 for desktop, py-8 for mobile

## Component Library

### Header
- Full-width fixed or sticky header with app name "RanaxHack Info App"
- Monospace typography with neon green glow effect
- Subtle scanline or grid background pattern
- Height: h-16 to h-20

### Section Cards (5 sections)
Each section displays as a distinct card/panel:
- Dark background with neon green border (2px)
- Clickable trigger button/card with hover glow effect
- Expandable input area that reveals on click
- Input fields: Dark background with neon green border, monospace text
- "Enter" button: Neon green background with black text, subtle pulse on hover
- Response area: Terminal-style output with monospace font and scrollable container

**Section Layout Pattern**:
1. Icon + Label (clickable trigger)
2. Collapsible input area (hidden by default)
3. API response display area (formatted JSON or structured data)

### Icons
- Use Font Awesome or Heroicons via CDN
- Icons for each section: phone, users/family, telegram, instagram, payment/wallet
- Neon green color (#00ff00) with optional glow effect

### Input Fields
- Dark background (#1a1a1a) with neon green border
- Green monospace text input
- Placeholder text in dark green (#004d00)
- Focus state: Brighter green border with subtle glow
- Error state: Red border (#ff0000)

### Buttons
- Primary: Neon green background, black text, bold monospace
- Hover: Slight brightness increase and subtle glow
- Active: Darker green with reduced glow
- Loading state: Animated dots or spinner in green

### Loading Indicators
- Matrix-style falling characters animation, OR
- Spinning terminal cursor/circle in neon green, OR
- Pulsing green dots pattern

### Response Display
- Terminal-style output box
- Black background with green monospace text
- Scrollable for long responses
- Format JSON with syntax highlighting (green keys, cyan values)
- Error messages in red text

## Animations
- **Minimal but Impactful**: Use sparingly for cyberpunk atmosphere
- Subtle scanline effect across background (optional)
- Glow pulse on hover for interactive elements
- Smooth expand/collapse for section reveals (300ms)
- Text flicker effect on load (one-time, brief)

## Responsive Design
- **Mobile (base to md)**: Single column, full-width cards, stacked sections
- **Desktop (lg+)**: Maintain single column for clarity, centered with max-width
- **Touch targets**: Minimum 44px height for buttons on mobile

## Accessibility
- High contrast maintained (green on black)
- Focus indicators with green outline
- Semantic HTML for screen readers
- Error messages clearly visible in red

## Special Effects
- Terminal cursor blink animation in input fields
- Subtle matrix-style background pattern or grid lines
- CRT monitor scanline overlay (very subtle, low opacity)
- Glitch effect on error states (brief animation)

## Images
**No hero image required** - This is a functional tool app, not a marketing page. Visual interest comes from the cyberpunk UI treatment and interactive elements.

## Technical Considerations
- Input validation: 10 digits for phone, valid Aadhaar format
- Loading states during API calls with visual feedback
- Error handling with clear red text messages
- Smooth transitions between states (collapsed/expanded sections)