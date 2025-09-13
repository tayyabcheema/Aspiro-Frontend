# AI Career Path - Authentication Flow

This project implements a comprehensive authentication flow with onboarding steps including CV collection.

## Authentication Flow

### 1. User Registration/Login
- Users can register with email and password
- Form validation includes:
  - Required fields
  - Email format validation
  - Password minimum length (6 characters)
  - Password confirmation matching

### 2. Onboarding with CV Collection (Required Step)
- After successful login, users are redirected to onboarding
- Multi-step questionnaire with CV information collection
- File upload option available during onboarding if needed
- Progress tracking through onboarding steps

### 3. Onboarding Questions (Required Step)
- Multi-step questionnaire with progress tracking
- Questions include:
  - Personal information (name)
  - Experience level
  - Current skills
  - Career goals
  - Educational background
- Form validation for required fields
- Smooth transitions between steps

### 4. Dashboard Access
- Only accessible after completing onboarding
- Personalized welcome message
- Progress tracking
- AI assistant chat
- Career roadmap visualization

## Project Structure

```
├── app/
│   ├── login/page.tsx          # Login form with validation
│   ├── register/page.tsx       # Registration form with validation
│   ├── onboarding/page.tsx     # Multi-step onboarding flow with CV collection
│   ├── dashboard/page.tsx      # Main dashboard (protected)
│   └── page.tsx               # Landing page with auth redirects
├── components/
│   ├── protected-route.tsx     # Route protection logic
│   └── loading-spinner.tsx     # Reusable loading component
├── lib/
│   ├── auth-context.tsx        # Authentication context
│   └── validation.ts          # Form validation utilities
└── README.md                  # This file
```

## Key Features

### Authentication Context
- Manages user state across the application
- Handles login/logout functionality
- Tracks user progress (onboarding completion)
- Persistent storage using localStorage

### Protected Routes
- Automatic redirects based on user progress
- Loading states during authentication checks
- Prevents access to incomplete flows

### Form Validation
- Real-time validation feedback
- Comprehensive error handling
- File upload validation
- Required field enforcement

### User Experience
- Smooth transitions between steps
- Progress indicators
- Loading states
- Error messaging
- Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing the Flow

### Regular Flow
1. **Register/Login**: Use any email and password (minimum 6 characters)
2. **Onboarding**: Complete the questionnaire and provide CV information
3. **Dashboard**: Access the main dashboard with personalized content

### Features
- **Reset Progress**: Use the "Reset Progress" button on the dashboard to start over
- **Progress Tracking**: Monitor your advancement through the onboarding process

## Dummy Data

The application uses simulated data for:
- User authentication
- File upload progress
- CV analysis results
- AI recommendations
- Career roadmap steps

All data is stored in localStorage for demonstration purposes.

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Custom UI Components** - Glass morphism design
