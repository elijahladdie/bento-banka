import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = "/bento-banka";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
        basePath: githubPagesBasePath,
        assetPrefix: `${githubPagesBasePath}/`,
      }
    : {}),
  env: {
    FRONTEND_STATE: process.env.FRONTEND_STATE,
  },
};


export default withNextIntl(nextConfig);
