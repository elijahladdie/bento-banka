export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
} as const;

export const DASHBOARD_ROUTES = {
  client: "/client/dashboard",
  cashier: "/cashier/dashboard",
  manager: "/manager/dashboard",
} as const;
