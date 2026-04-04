import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    FRONTEND_STATE: process.env.FRONTEND_STATE,
  },
};
console.log(nextConfig)

export default withNextIntl(nextConfig);
