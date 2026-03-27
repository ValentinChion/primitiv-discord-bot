import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unicorn from "eslint-plugin-unicorn";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  unicorn.configs["flat/recommended"],
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
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files — not our code to lint
    "prisma/**",
    "components/ui/**",
    "hooks/**",
  ]),
]);

export default eslintConfig;
