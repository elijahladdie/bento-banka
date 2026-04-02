# BANKA Frontend Twin Rebuild Command

Use the command below in Copilot Chat (or any coding agent) inside a fresh repository to generate an identical twin of this BANKA frontend, preserving feature parity and backend integration, while upgrading visual quality to advanced glassmorphism + bento UI.

## One-Shot Command

```text
Create a Next.js 15 App Router TypeScript application named banka-twin with exact functional parity to the existing BANKA frontend.

Hard requirements:
1) Keep all current features with no omissions.
2) Keep backend contract compatibility with the existing Express API under /api.
3) Preserve role-based behavior (client, cashier, manager).
4) Preserve current state management pattern (Redux Toolkit + async thunks + auth context compatibility).
5) Preserve API data handling semantics (token persistence, Authorization header injection, error extraction, pagination support, and refetch after mutating actions).
6) Upgrade UI to a more advanced glassmorphism and bento-box design system while preserving functional behavior.
7) Keep trilingual readiness (en, fr, kin), and ensure all user-facing text is translation-key based.

Create and configure:
- Next.js 15 + React 18 + TypeScript + Tailwind.
- UI primitives: Radix + shadcn-style components.
- State: @reduxjs/toolkit + react-redux.
- Data/query support: @tanstack/react-query.
- HTTP: axios with interceptors.
- Validation/tooling: zod, react-hook-form, eslint, vitest.

Install dependencies equivalent to:
- next, react, react-dom, axios, @reduxjs/toolkit, react-redux, @tanstack/react-query, next-intl, zod, react-hook-form, @hookform/resolvers, lucide-react, recharts, sonner, radix UI set used by current app, class-variance-authority, clsx, tailwind-merge.

Environment and API:
- Add NEXT_PUBLIC_API_BASE_URL with default http://localhost:5000/api.
- Create lib/api-client.ts axios instance:
  - baseURL from NEXT_PUBLIC_API_BASE_URL.
  - withCredentials true.
  - Content-Type application/json.
  - request interceptor injects Bearer token from localStorage key banka_token.
- Add auth storage helper: setToken/getToken/clearToken.
- Add standardized error extraction for AxiosError payload.message.

Provider tree (root layout/providers):
- Redux Provider -> React Query Provider -> Tooltip Provider -> Auth Context Provider(s) -> Toast Provider -> App.
- Keep global toasters and toast container mounted once.
- Keep animated background/orb atmosphere and app-shell wrapper.

Routing and pages (top to bottom, no skips):
1) Public:
  - / (landing page with hero, features, stats, workflow steps, CTA to login/signup).
2) Auth:
  - /login (email/password, remember me, role redirect after login).
  - /signup (client registration, age >= 18, pending approval flow).
  - /forgot-password (request reset email).
3) Client:
  - /client/dashboard
  - /client/accounts
  - /client/transfer
  - /client/profile
4) Cashier:
  - /cashier/dashboard
  - /cashier/clients
5) Manager:
  - /manager/dashboard
  - /manager/users
  - /manager/accounts
  - /manager/transactions
  - /manager/approvals
  - /manager/statistics
6) Utility:
  - /api/health route in Next app.
  - not-found page.

Authorization and protection:
- Implement middleware route guard:
  - Public routes: /, /login, /signup, /forgot-password, /reset-password.
  - Protected routes require token.
  - Role prefix routing:
    - /client/* requires client role
    - /cashier/* requires cashier role
    - /manager/* requires manager role
- Implement client-side RoleGuard for protected pages.

Navigation and dashboard shell:
- Single DashboardLayout with role-specific nav menus:
  - client: dashboard, accounts, transfer, profile.
  - cashier: dashboard, search client.
  - manager: dashboard, users, accounts, transactions, approvals, statistics.
- Include logout action, avatar, role label, notification icon, desktop sidebar + mobile nav.

State management (must match behavior):
- store/index.ts with reducers:
  - auth slice
  - banking slice
- auth slice async thunks:
  - loginThunk -> POST /auth/login
  - fetchMeThunk -> GET /auth/me
  - logoutThunk -> POST /auth/logout
  - persist token in localStorage key banka_token
  - derive role from user.userRoles[0].role.slug
- banking slice async thunks:
  - fetchAccountsThunk -> GET /accounts
  - fetchTransactionsThunk -> GET /transactions
  - fetchUsersThunk -> GET /users
  - fetchStatsThunk -> GET /stats/overview + /stats/transactions + /stats/accounts + /stats/users (parallel)
  - transferFundsThunk -> POST /transactions/transfer
  - depositFundsThunk -> POST /transactions/deposit
  - withdrawFundsThunk -> POST /transactions/withdraw
  - approveAccountThunk -> PATCH /accounts/:id/approve
  - rejectAccountThunk -> PATCH /accounts/:id/reject
  - updateUserStatusThunk -> PATCH /users/:id/status
- Keep loading/error state partitions and pagination objects.

Backend integration compatibility map:
- Auth:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/forgot-password
  - POST /auth/reset-password
  - GET /auth/me
- Accounts:
  - POST /accounts
  - GET /accounts
  - GET /accounts/:id
  - PATCH /accounts/:id/approve
  - PATCH /accounts/:id/reject
  - PATCH /accounts/:id/status
- Transactions:
  - POST /transactions/deposit
  - POST /transactions/withdraw
  - POST /transactions/transfer
  - GET /transactions
  - GET /transactions/:id
- Users (manager):
  - GET /users
  - POST /users
  - GET /users/:id
  - PATCH /users/:id
  - PATCH /users/:id/status
  - DELETE /users/:id
- Stats (manager):
  - GET /stats/overview
  - GET /stats/transactions
  - GET /stats/accounts
  - GET /stats/users

Feature-level behavior to preserve:
- Client dashboard: account summary, own recent transactions, quick transfer panel, notifications placeholder.
- Client accounts: list owned accounts, copy account number.
- Client transfer: transfer form with validation, optimistic UX and post-success refetch.
- Client profile: profile view/edit shell and password change shell.
- Cashier dashboard: search client, deposit/withdraw actions, operations table.
- Cashier clients: searchable client cards and account actions.
- Manager dashboard: KPI cards, pending approvals, recent transactions, users table.
- Manager users/accounts/transactions: list and filter/monitor views.
- Manager approvals: approve/reject pending clients and accounts.
- Manager statistics: totals and series breakdown visualizations.

Design system upgrade rules (advanced glass + bento):
- Keep atmospheric background with layered animated gradients/orbs.
- Define semantic CSS variables for glass surfaces, borders, depth shadows, text tiers, status colors, spacing, radii, and transitions.
- Replace plain cards/tables/inputs/buttons with glass primitives:
  - GlassCard, GlassButton (pill), GlassInput, GlassSelect, GlassTable, ConfirmModal, PaginationBar, StatusBadge, AmbientBackground.
- Use bento grids with responsive spans and composable card sizes.
- Ensure WCAG contrast and readable typography.
- Add meaningful motion only: subtle reveal, hover lift, and background drift.

Internationalization rules:
- Keep locale files for en, fr, kin.
- Move all hard-coded user-facing text into translation keys.
- Keep language switcher and locale-aware rendering readiness.

Data handling and resilience:
- Strong TypeScript domain models for User, Account, Transaction, Stats, Pagination, ApiSuccess/ApiError.
- Normalize role extraction for client/cashier/manager.
- Handle 401 by redirecting to login and/or clearing invalid auth state.
- Maintain consistent loading, empty, and error states for all screens.
- Ensure all mutation actions trigger precise refetch for dependent datasets.

Testing and quality:
- Add baseline tests for auth reducer/thunks, banking reducer/thunks, and protected route behavior.
- Add smoke tests for core pages and role guards.
- Lint and type-check must pass.

Delivery format:
1) Generate full project structure.
2) Populate core files first (providers, api client, store, slices, middleware, auth context).
3) Then implement pages/components per route order listed above.
4) Then wire i18n keys and translation files.
5) Then finish styling with advanced glassmorphism and bento layouts.
6) Run lint, tests, and type-check and provide a final integration report mapping each frontend action to backend endpoint.

Do not skip any route, thunk, endpoint, or role flow listed above.
```

## Optional Bootstrap Shell Commands

```bash
npx create-next-app@latest banka-twin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd banka-twin
npm i axios @reduxjs/toolkit react-redux @tanstack/react-query next-intl zod react-hook-form @hookform/resolvers lucide-react recharts sonner class-variance-authority clsx tailwind-merge
npm i @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-toast @radix-ui/react-tabs @radix-ui/react-checkbox
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Then paste the One-Shot Command into Copilot Chat and let it implement the full twin.
