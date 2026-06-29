# Technical Specification: Authentication & Identity Subsystem

## 1. Purpose
The Authentication & Identity Subsystem manages client-side user authentication, Google OAuth popup sign-ins, session persistence, and user identity state propagation across SomeoneOS React components.

---

## 2. Responsibilities
- Initializes Firebase Web SDK App and Authentication instances safely across Client/SSR environments.
- Provides a centralized React Context (`AuthProvider`) wrapping Firebase `onAuthStateChanged` listeners.
- Exposes clean helper functions (`signInWithGoogle`, `signOutUser`) and custom context consumer hook (`useAuth`).

---

## 3. Inputs & Outputs
- **Inputs**: User interaction events (clicks on sign-in/sign-out buttons).
- **Outputs**: Active Firebase `User` object or `null`, loading boolean state, and async authentication trigger functions.

---

## 4. Dependencies
- Firebase Web SDK (`firebase/app`, `firebase/auth`).
- React Context API.
- Environment variables (`NEXT_PUBLIC_FIREBASE_*`).

---

## 5. Public Interfaces & Wrappers
- **Firebase Config Module**: [lib/firebase.ts](file:///d:/Codes/Projects/someoneos/lib/firebase.ts) (`app`, `auth`, `googleProvider`).
- **Auth Context Provider**: [lib/auth.ts](file:///d:/Codes/Projects/someoneos/lib/auth.ts) (`AuthProvider`, `useAuth`, `signInWithGoogle`, `signOutUser`).
- **UI Components**: [components/GoogleSignInButton.tsx](file:///d:/Codes/Projects/someoneos/components/GoogleSignInButton.tsx), [components/UserProfile.tsx](file:///d:/Codes/Projects/someoneos/components/UserProfile.tsx).

---

## 6. Internal Workflow

```mermaid
flowchart TD
    A[App Initialization / Mount] --> B[AuthProvider mounts in root layout]
    B --> C[Attach onAuthStateChanged listener to Firebase Auth]
    
    alt User clicks Google Sign In
        D[User clicks GoogleSignInButton] --> E[Call signInWithGoogle]
        E --> F[Trigger signInWithPopup googleProvider]
        F --> G[Firebase authenticates & emits user event]
    end
    
    G --> C
    C --> H[Update setUser currentUser & setLoading false]
    H --> I[Re-render client component tree with active User context]
```

---

## 7. Future Extension Points
- **Firestore User Profile Sync**: Automatically create or update a `users/{userId}` document upon initial sign-in.
- **Server-Side Token Verification**: Implement Next.js middleware with Firebase Admin SDK to verify session cookies for protected API routes.

---

## 8. Known Limitations
- Runs purely on the client side; server-side rendered pages cannot inspect authentication state without session cookies.

---

## 9. Testing Strategy
- **Component Mocking**: Mock `useAuth` hook in React Testing Library component tests to simulate authenticated and unauthenticated states.
