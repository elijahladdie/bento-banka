# BANKA Frontend

BANKA is a modern banking frontend built with Next.js App Router and TypeScript.
It provides role-based dashboards and workflows for:

- Clients
- Cashiers
- Managers

The UI follows a glassmorphism visual system with reusable components, responsive layouts, and multilingual support.

## Live Demo

- https://elijahladdie.github.io/bento-banka/

## Core Functionalities

### Authentication

- Sign in
- Sign up
- Forgot password
- Role-based post-login redirection

### Role-Based Dashboards

- Client dashboard, accounts, transactions, profile
- Cashier dashboard, clients, transactions
- Manager dashboard, approvals, users, accounts, statistics, transactions

### Banking Workflows

- Account management flows
- Transaction listing and actions
- Approval and operations screens
- Notifications page

### Profile & Media Upload

- Unified profile experience
- Optional profile picture upload during signup
- Client-side image validation (file type and size)
- Cloudinary upload integration

### Internationalization

- i18n-ready architecture
- Message catalogs for:
	- English (`messages/en.json`)
	- French (`messages/fr.json`)
	- Kinyarwanda (`messages/kin.json`)

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Redux Toolkit
- React Query
- Axios
- next-intl
- Radix UI primitives + custom glass UI components

## Project Structure (High Level)

- `src/app`: App Router routes and pages
- `src/components`: Shared UI and feature components
- `src/components/ui`: Reusable glass design system components
- `src/contexts` and `src/context`: App providers and context state
- `src/store`: Redux store and slices
- `src/lib`: Utilities, API client, i18n and helpers
- `src/services`: Domain/service logic
- `messages`: Translation dictionaries

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
FRONTEND_STATE=client
```

Notes:

- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` must be an unsigned upload preset configured in Cloudinary.
- Signup profile image upload uses Cloudinary directly from the browser.
- `FRONTEND_STATE` controls frontend behavior for environments (for example demo credential visibility on login).

### 3. Start development server

```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Run development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run linting
- `npm run test`: Run tests once
- `npm run test:watch`: Run tests in watch mode

## Build & Deployment Notes

- The project supports static export for GitHub Pages deployment.
- GitHub Actions can build and deploy to Pages using repository secrets.
- For Pages build mode, environment variables are injected during CI build.

## Signup Profile Picture Flow

During signup:

- User selects an optional profile image.
- Validation runs client-side (image mime type, max 2MB).
- Image is uploaded to Cloudinary.
- `secure_url` is sent as `profilePicture` in registration payload.
- If no file is selected, `profilePicture` is sent as `null`.

If Cloudinary variables are missing, signup shows an error and prevents submission.
