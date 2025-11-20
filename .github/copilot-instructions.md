# TimberID Sample Tracking - AI Coding Agent Instructions

## Project Overview

TimberID is a Next.js/Firebase application for tracking timber sample isotopic measurements to verify wood origin authenticity. The system manages sample lifecycle from collection through laboratory analysis to validity determination.

## Architecture & Key Technologies

- **Frontend**: Next.js with static export (`output: 'export'`) for Firebase Hosting
- **Backend**: Firebase Firestore + Cloud Functions for data validation
- **Auth**: Firebase Auth with custom claims for role-based access (`site_admin`, `org_user`, etc.)
- **State**: React Query for server state, custom hooks for Firebase integration
- **Styling**: TailwindCSS with custom component library in `src/components/ui/`
- **Validation**: Zod schemas (see `src/old_components/Sample/sample-schema.ts`)
- **Internationalization**: i18next with Portuguese as default (`fallbackLng: "pt"`)

## Critical Data Models & Business Logic

### Sample Entity (`src/types/Samples.tsx`)

```typescript
type Sample = {
  code_lab: string; // Document ID in Firestore
  org: string; // Organization ID for access control
  validity: string; // "Possible" | "NotLikely" | "Trusted" | "Undetermined"
  trusted: string; // "known_origin" | "uncertain_origin"
  measurements: {}; // Isotopic measurements (d18O_cel, d13C_cel, etc.)
  // Location fields: lat, lon, state, city, municipality
  // Collection fields: date_of_harvest, collected_by, supplier
  // Measurement fields: species, diameter, sample_type
};
```

### Isotopic Measurement Validation

The system validates isotopic measurements with specific ranges (in `src/types/Samples.tsx`):

```typescript
const resultRanges = {
  d18O_cel: { min: 20, max: 32 },
  d15N_wood: { min: -5, max: 15 },
  d13C_wood: { min: -38, max: 20 },
  // ... other measurement ranges
};
```

### Access Control Pattern

```typescript
// In useFirebaseSamples.tsx - Critical for data security
if (userData.role === "site_admin") {
  // See all samples
  return collectionRef;
} else if (userData.org != null) {
  // See organization samples only
  return query(collectionRef, where("org", "==", userData.org));
} else {
  // Public samples only
  return query(collectionRef, where("visibility", "==", "public"));
}
```

## Development Workflow

### Essential Commands

```bash
# Development (runs on port 3000)
npm run dev

# Production build for Firebase (static export)
npm run build

# Deploy to Firebase (Windows-specific commands in package.json)
npm run deploy:dev   # rd /s /q .next && firebase use default && next build && next export && firebase deploy --only hosting
npm run deploy:dev2  # firebase use default && next build && next export && firebase deploy --only hosting

# Testing with Firestore mocks
npm test

# Code quality
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Prettier formatting
```

### Firebase Architecture

- **Database**: `/samples` collection with org-based access control
- **Functions**: Role management in `/functions/index.js` (approveRole, pauseAccess)
- **Hosting**: Static export deployed to Firebase Hosting with SPA routing (`firebase.json` rewrites)
- **Auth**: Custom claims set by Cloud Functions for role management
- **Collections**: `/roles_to_be_updated/{documentId}` triggers for user role management

## Component & Hook Patterns

### Firebase Integration Hooks

- `useFirebaseSamples()`: Main data fetching with access control
- `useAuth()`: Authentication with automatic redirect handling
- `useCurrentUser()`: User data with org/role information
- `useGlobal()`: Global state for navbar/topbar visibility and app-wide state

### State Management Pattern

The app uses a hybrid approach:

```typescript
// Global state via Context API
const { setShowNavBar, setShowTopBar } = useGlobal();

// Server state via React Query
const { data: samples, loading } = useSamplesFromCollection(
  userData,
  "samples"
);
```

### Form Handling Pattern

```typescript
// Use react-hook-form with Zod validation
const { control, handleSubmit } = useForm({
  resolver: zodResolver(SampleCompleteSchema),
});
```

### Component Structure

- `src/components/ui/`: Reusable components (Dialog, Select, TextInput, etc.)
- `src/components/layout/`: Navigation and layout components
- `src/old_components/`: Legacy components being migrated (avoid editing)
- `src/old_components/components/`: Domain-specific components (ValiditySection, MeasurementsSection, etc.)

### UI Component Library

The project has a custom UI library with consistent patterns:

```typescript
// Example from TextInput component
<TextInput
  label="Sample Name"
  placeholder="Enter sample name"
  error={errors.sample_name?.message}
  {...register("sample_name")}
/>
```

## Testing Strategy

- Jest + React Testing Library for component tests
- Firestore Jest Mock (`firestore-jest-mock`) for Firebase integration tests
- All tests mock i18n (`react-i18next`) and Firebase config
- Test files follow naming: `__tests__/*.test.js`
- Mock pattern for hooks: `useGlobal`, Firebase services, and i18n must be mocked in all tests

## Deployment & Build Considerations

- **Static Export**: Next.js configured for static generation (`output: 'export'`)
- **Firebase Hosting**: Uses `out/` directory with SPA rewrites
- **Environment**: Node.js 20.10.0 required (specified in package.json)
- **Images**: Unoptimized due to static export limitations

## Critical Files & Dependencies

- `src/services/firebase/config.ts`: Firebase initialization
- `src/old_components/Sample/sample-schema.ts`: Comprehensive validation schemas
- `firebase.json`: Hosting config with SPA routing rules
- `src/i18n/config.tsx`: Internationalization setup (Portuguese default)
- `src/pages/_app.tsx`: App-level providers and global setup
- `src/hooks/useGlobal.tsx`: Global state context provider

## Code Quality Standards

- TypeScript strict mode with build error ignoring (legacy compatibility)
- ESLint with Airbnb config + Next.js rules
- Prettier formatting
- Moment.js for date handling (Portuguese locale)

## Navigation & Routing

The app uses a custom routing pattern with Next.js pages:

- Main pages in `src/pages/` with index.tsx + page.tsx structure
- `GlobalProvider` context manages navbar/topbar visibility
- Authentication redirects handled in `useAuth()` hook

## Important Gotchas

- **Static Export**: No server-side features (ISR, API routes) due to `output: 'export'`
- **TypeScript**: Build errors ignored (`ignoreBuildErrors: true`) for legacy compatibility
- **Windows Commands**: Deploy scripts use Windows-specific commands (`rd /s /q`)
- **Moment.js**: Configured for Portuguese locale (`pt-br`)
- **Environment Variables**: Firebase config requires NEXT*PUBLIC* prefixed variables for client-side access

When working on this codebase:

1. **Always** consider org-based access control when querying samples
2. Use existing UI components in `src/components/ui/` before creating new ones
3. Follow the Zod schema validation patterns for forms
4. Test Firebase integrations with the existing mock patterns
5. Maintain Portuguese as primary language in i18n keys
