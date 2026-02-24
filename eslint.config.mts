import js from "@eslint/js";
// flatConfig is a named export — default export only has { rules, configs }
import { flatConfig as nextFlatConfig } from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";
// eslint-plugin-tailwindcss ships without TypeScript declarations; use require().
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindPlugin = require("eslint-plugin-tailwindcss") as {
  configs: { "flat/recommended": import("typescript-eslint").ConfigWithExtends[] };
  rules: Record<string, import("eslint").Rule.RuleModule>;
};
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
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },

  // ── Base rule sets ────────────────────────────────────────────────────────
  // Explicit JS baseline — covers vanilla JS best-practices before TypeScript
  // layer adds its own recommended rules on top.
  js.configs.recommended,

  ...tseslint.configs.recommended,

  // Next.js core-web-vitals rules — flatConfig is a named export, not a
  // property on the default export. Cast bridges the string-keyed rules type.
  nextFlatConfig.coreWebVitals as unknown as import("typescript-eslint").ConfigWithExtends,

  // React recommended + JSX-runtime (React 17+ / React 19 new JSX transform;
  // no need to import React in every file for JSX).
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

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
      // Tell eslint-plugin-react to auto-detect the installed React version
      react: { version: "detect" },
    },
  },
  importRecommended,
  importTypescript,

  // Tailwind CSS — flat/recommended registers the plugin + sets sane defaults
  // (classnames-order: warn, no-custom-classname: warn, no-contradicting-classname: error)
  ...tailwindPlugin.configs["flat/recommended"],

  // ── TypeScript & React quality rules ─────────────────────────────────────
  // Enforce `import type` for type-only imports so runtime bundles stay lean
  // and cross-layer type imports never create accidental runtime coupling.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // Ban accidental `any` — surfaces hidden type holes
      "@typescript-eslint/no-explicit-any": "error",
      // Dead code: unused variables are always errors
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React list-rendering correctness
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      // JSX hygiene
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "error",
      // TypeScript handles prop types — no need for runtime prop-types validation
      "react/prop-types": "off",
      // React Hooks correctness
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Prefer absolute @/* imports; forbid ../../ parent-relative imports
      "import/no-relative-parent-imports": "warn",
      // Override flat/recommended severities where we want stricter control
      "tailwindcss/no-custom-classname": "warn",
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-contradicting-classname": "error",
    },
  },

  // ── TypeScript type-aware rules ───────────────────────────────────────────
  // These rules require full TypeScript type information (parserServices).
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // Catches async callbacks passed where synchronous callbacks are expected.
      // attributes: false — async JSX event handlers (onClick, onSubmit) are intentional in React.
      "@typescript-eslint/no-misused-promises": ["error", { "checksVoidReturn": { "attributes": false } }],
      // Warns when non-boolean values are used in boolean contexts
      "@typescript-eslint/strict-boolean-expressions": "warn",
    },
  },

  // utility-hooks generated files — official shadcn utility hooks, not to be modified.
  {
    files: ["src/shared/utility-hooks/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unknown-property": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },

  // shadcn-ui — official UI primitives. DO NOT MODIFY.
  // These files are scaffolded by the shadcn-ui CLI and must be kept in their original state.
  // All inherited quality rules are disabled to avoid noise from generated component patterns.
  // The single active rule flags any new assignment that is not a standard .displayName setter,
  // making accidental edits immediately visible during linting.
  {
    files: ["src/shared/shadcn-ui/**/*.{ts,tsx}"],
    rules: {
      // Disable TypeScript rules that fire on generated component code
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      // Disable React rules (primitive wrappers are intentionally low-level)
      "react/jsx-key": "off",
      "react/no-array-index-key": "off",
      "react/jsx-no-useless-fragment": "off",
      "react/self-closing-comp": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      // Disable accessibility rules (shadcn-ui delegates a11y responsibility to consumers)
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/interactive-supports-focus": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/label-has-associated-control": "off",
      // Disable import / tailwind style rules
      "import/no-relative-parent-imports": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-contradicting-classname": "off",
      // ── Modification guard ──────────────────────────────────────────────────
      // Flags any assignment that is NOT a standard `.displayName = "..."` setter.
      // React.forwardRef components always set .displayName — those are excluded.
      // Any other assignment indicates an unsanctioned modification to these files.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "AssignmentExpression:not([left.type='MemberExpression'][left.property.name='displayName'])",
          message: "禁止修改 shadcn-ui 內部檔案",
        },
      ],
    },
  },

  // ── VSA one-way dependency rules ─────────────────────────────────────────
  // Architecture (Vertical Slice Architecture):
  //
  //   app/  →  features/{name}/index.ts  →  shared/*
  //
  // Three invariants:
  //   1. shared/* has zero feature and zero app dependencies
  //   2. features/* imports shared/* freely; cross-slice imports go through index.ts only
  //   3. app/* imports features through public index.ts APIs; never feature internals

  // ── "use client" protection ──────────────────────────────────────────────
  // shared/types, shared/lib, shared/infra, shared/ai are always server-side
  // or framework-agnostic. A "use client" directive in them is an arch mistake.
  {
    files: [
      "src/shared/types/**/*.{ts,tsx}",
      "src/shared/lib/**/*.{ts,tsx}",
      "src/shared/infra/**/*.{ts,tsx}",
      "src/shared/ai/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement > Literal[value='use client']",
          message:
            "This shared module must never contain a 'use client' directive — it is server-side or framework-agnostic.",
        },
      ],
    },
  },

  // shared/*: cross-cutting infrastructure — no feature dependencies, no app
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features", "@/features/**"],
              message: "shared/* must not import from features/ — zero feature dependencies in shared",
            },
            {
              group: ["@/app", "@/app/**"],
              message: "shared/* must not import from app/ — one-way dependency rule",
            },
          ],
        },
      ],
    },
  },

  // features/*: vertical slices — no app imports; cross-slice only via index.ts
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app", "@/app/**"],
              message: "features/* must not import from app/ — one-way dependency rule",
            },
            {
              // Forbid cross-feature access to slice-private (_-prefixed) files.
              // Within-slice code uses relative paths, so @/features/own-slice/_x won't appear here.
              group: ["@/features/**/_*"],
              message:
                "Cross-feature imports must go through index.ts — do not import private (_-prefixed) files from another slice",
            },
          ],
        },
      ],
    },
  },

  // app/*: routing only — no feature internals; must use public index.ts API
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/**/_*"],
              message:
                "app/ must not import feature internals directly — use features/{name}/index.ts (public API only)",
            },
          ],
        },
      ],
    },
  },
);
