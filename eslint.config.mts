import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";

const importRecommended = importPlugin.flatConfigs.recommended;
const importTypescript = importPlugin.flatConfigs.typescript;
const jsxA11yStrict = jsxA11y.flatConfigs.strict;
const reactHooksRecommended = reactHooks.configs.flat.recommended;
const [nextBaseConfig, ...nextCoreConfigs] = nextCoreWebVitals;

export default [
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
  {
    ...nextBaseConfig,
    settings: {
      ...(nextBaseConfig?.settings ?? {}),
      ...(importTypescript.settings ?? {}),
    },
    rules: {
      ...(nextBaseConfig?.rules ?? {}),
      ...reactHooksRecommended.rules,
      ...jsxA11yStrict.rules,
      ...importRecommended.rules,
      ...importTypescript.rules,
    },
  },
  ...nextCoreConfigs,
  ...nextTypescript,
];