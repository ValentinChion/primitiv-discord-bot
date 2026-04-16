import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unicorn from "eslint-plugin-unicorn";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  unicorn.configs["recommended"],
  {
    rules: {
      // Next.js enforces its own file naming (page.tsx, route.ts, layout.tsx)
      "unicorn/filename-case": "off",
      // Too noisy with React patterns (props, ref, params, err, etc.)
      "unicorn/prevent-abbreviations": "off",
      // React and Prisma use null extensively
      "unicorn/no-null": "off",
      // Common pattern for data transformations
      "unicorn/no-array-reduce": "off",
      // Fonts are loaded via <link> tags intentionally — @import in globals.css
      // breaks Tailwind's inline expansion (see CLAUDE.md)
      "@next/next/no-page-custom-font": "off",
    },
  },
  {
    // Schedule public page and features use raw <img> tags for artist photos
    // served from R2 — next/image would require remote domain config and doesn't
    // fit the custom-styled public page (no Shadcn, custom tokens).
    files: [
      "app/(public)/schedule/**",
      "features/schedule/**",
      "features/schedule-handler/**",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Standard patterns the rule flags but which are intentional:
    // - syncing form state with props on dialog open (slot-dialog)
    // - checking browser APIs after mount (install-prompt, notification-optin)
    files: [
      "components/install-prompt.tsx",
      "components/notification-optin.tsx",
      "features/schedule-handler/slot-dialog.tsx",
      "app/(admin)/primitiv/schedule-handler/page.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    ".wrangler/**",
    "node_modules/**",
    "next-env.d.ts",
    // Generated / third-party files — not our code to lint
    "prisma/**",
    "components/ui/**",
    "hooks/**",
    "public/sw.js",
  ]),
]);

export default eslintConfig;
