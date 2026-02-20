import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import * as reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const importRecommended = importPlugin.flatConfigs.recommended;
const importTypescript = importPlugin.flatConfigs.typescript;
const jsxA11yStrict = jsxA11y.flatConfigs.strict;
// Use "recommended-latest" — the flat-config-compatible preset
const reactHooksRecommended = reactHooks.configs["recommended-latest"];

export default tseslint.config(
  // ── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "functions/**",
    ],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },

  // ── Base rule sets ────────────────────────────────────────────────────────
  ...tseslint.configs.recommended,

  // Next.js core-web-vitals rules (flat config)
  nextPlugin.flatConfig.coreWebVitals,

  // React Hooks rules
  reactHooksRecommended,

  // Accessibility rules
  jsxA11yStrict,

  // Import rules (resolve + TypeScript extensions)
  // Configure TypeScript resolver so @/* aliases from tsconfig.json are resolved
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
    },
  },
  importRecommended,
  importTypescript,

  // ── One-way layer dependency rules ───────────────────────────────────────
  // Each config block covers one src/ layer and forbids imports from layers
  // that sit above it in the dependency hierarchy, preventing circular deps.
  // Architecture: domain-types → domain-rules/firebase/genkit-flows/shared
  //   → server-commands → react-hooks/react-providers → use-cases
  //   → view-modules → app

  // domain-types: foundation — zero internal dependencies
  {
    files: ["src/domain-types/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/firebase", "@/firebase/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/domain-rules", "@/domain-rules/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/server-commands", "@/server-commands/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/shared", "@/shared/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "domain-types must not import from any other src layer" },
            { group: ["@/app", "@/app/**"], message: "domain-types must not import from any other src layer" },
          ],
        },
      ],
    },
  },

  // domain-rules: pure logic — no I/O, no async, no frameworks
  {
    files: ["src/domain-rules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react/**", "react-dom", "react-dom/**"], message: "domain-rules must not depend on React" },
            { group: ["next", "next/**"], message: "domain-rules must not depend on Next.js" },
            { group: ["firebase", "firebase/**"], message: "domain-rules must not depend on Firebase SDK" },
            { group: ["@/firebase", "@/firebase/**"], message: "domain-rules must not import from firebase layer" },
            { group: ["@/server-commands", "@/server-commands/**"], message: "domain-rules must not import from server-commands" },
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "domain-rules must not import from react-hooks" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "domain-rules must not import from react-providers" },
            { group: ["@/shared", "@/shared/**"], message: "domain-rules must not import from shared" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "domain-rules must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "domain-rules must not import from view-modules" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "domain-rules must not import from genkit-flows" },
            { group: ["@/app", "@/app/**"], message: "domain-rules must not import from app layer" },
          ],
        },
      ],
    },
  },

  // firebase: sole Firebase gateway — no React, no higher layers
  {
    files: ["src/firebase/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react/**", "react-dom", "react-dom/**"], message: "firebase layer must not depend on React" },
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "firebase layer must not import from react-hooks" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "firebase layer must not import from react-providers" },
            { group: ["@/server-commands", "@/server-commands/**"], message: "firebase layer must not import from server-commands" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "firebase layer must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "firebase layer must not import from view-modules" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "firebase layer must not import from genkit-flows" },
            { group: ["@/shared", "@/shared/**"], message: "firebase layer must not import from shared" },
            { group: ["@/app", "@/app/**"], message: "firebase layer must not import from app layer" },
          ],
        },
      ],
    },
  },

  // genkit-flows: AI layer — server-side only, no React/UI
  {
    files: ["src/genkit-flows/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "genkit-flows must not import from react-hooks" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "genkit-flows must not import from react-providers" },
            { group: ["@/server-commands", "@/server-commands/**"], message: "genkit-flows must not import from server-commands" },
            { group: ["@/shared", "@/shared/**"], message: "genkit-flows must not import from shared" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "genkit-flows must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "genkit-flows must not import from view-modules" },
            { group: ["@/app", "@/app/**"], message: "genkit-flows must not import from app layer" },
          ],
        },
      ],
    },
  },

  // server-commands: server boundary — no React, no UI, no higher layers
  {
    files: ["src/server-commands/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react/**", "react-dom", "react-dom/**"], message: "server-commands must not depend on React" },
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "server-commands must not import from react-hooks" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "server-commands must not import from react-providers" },
            { group: ["@/shared", "@/shared/**"], message: "server-commands must not import from shared" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "server-commands must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "server-commands must not import from view-modules" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "server-commands must not import from genkit-flows" },
            { group: ["@/app", "@/app/**"], message: "server-commands must not import from app layer" },
          ],
        },
      ],
    },
  },

  // shared: cross-cutting utilities — no domain services or higher layers
  // Exception: shared/app-providers may import from @/firebase (infrastructure wiring)
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    ignores: ["src/shared/app-providers/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/firebase", "@/firebase/**"], message: "shared utilities must not import from firebase layer" },
            { group: ["@/domain-rules", "@/domain-rules/**"], message: "shared utilities must not import from domain-rules" },
            { group: ["@/server-commands", "@/server-commands/**"], message: "shared utilities must not import from server-commands" },
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "shared utilities must not import from react-hooks" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "shared utilities must not import from react-providers" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "shared utilities must not import from genkit-flows" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "shared utilities must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "shared utilities must not import from view-modules" },
            { group: ["@/app", "@/app/**"], message: "shared utilities must not import from app layer" },
          ],
        },
      ],
    },
  },

  // react-hooks: logic bridge — no app layer, no genkit-flows (per README)
  {
    files: ["src/react-hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "react-hooks must not import from genkit-flows" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "react-hooks must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "react-hooks must not import from view-modules" },
            { group: ["@/app", "@/app/**"], message: "react-hooks must not import from app layer" },
          ],
        },
      ],
    },
  },

  // react-providers: state management — no app layer, no genkit-flows (per README)
  {
    files: ["src/react-providers/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "react-providers must not import from genkit-flows" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "react-providers must not import from use-cases" },
            { group: ["@/view-modules", "@/view-modules/**"], message: "react-providers must not import from view-modules" },
            { group: ["@/app", "@/app/**"], message: "react-providers must not import from app layer" },
          ],
        },
      ],
    },
  },

  // use-cases: orchestration + view bridges — no firebase direct, no React context
  {
    files: ["src/use-cases/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/firebase", "@/firebase/**"], message: "use-cases must not import firebase directly; go through server-commands" },
            { group: ["@/react-hooks", "@/react-hooks/**"], message: "use-cases must not import from react-hooks" },
            { group: ["@/react-providers", "@/react-providers/**"], message: "use-cases must not import from react-providers" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "use-cases must not import from genkit-flows" },
            { group: ["@/app", "@/app/**"], message: "use-cases must not import from app layer" },
          ],
        },
      ],
    },
  },

  // view-modules: feature views — no app layer, no use-cases (reverse dep), no firebase direct
  {
    files: ["src/view-modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/firebase", "@/firebase/**"], message: "view-modules must not import firebase directly; use react-hooks or server-commands" },
            { group: ["@/use-cases", "@/use-cases/**"], message: "view-modules must not import from use-cases (circular dep: use-cases depends on view-modules)" },
            { group: ["@/genkit-flows", "@/genkit-flows/**"], message: "view-modules must not import from genkit-flows" },
            { group: ["@/app", "@/app/**"], message: "view-modules must not import from app layer (one-way dep rule)" },
          ],
        },
      ],
    },
  },
);