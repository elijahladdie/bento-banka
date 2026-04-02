declare module "lovable-agent-playwright-config/fixture" {
  export { test, expect } from "@playwright/test";
}

declare module "lovable-agent-playwright-config/config" {
  import type { PlaywrightTestConfig } from "@playwright/test";

  export function createLovableConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;
}
