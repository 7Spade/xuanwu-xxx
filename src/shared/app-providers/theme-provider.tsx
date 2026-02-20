"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * Theme Context
 * 
 * Provides theme switching functionality using next-themes.
 * Supports light, dark, and system preference modes.
 * 
 * Usage:
 * - Wrap app with ThemeProvider in root layout
 * - Use useTheme hook in components to access/change theme
 * 
 * @example
 * ```tsx
 * import { useTheme } from '@/shared/app-providers/theme-provider';
 * 
 * function ThemeToggle() {
 *   const { theme, setTheme } = useTheme();
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Toggle theme
 *     </button>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

/**
 * useTheme Hook
 * 
 * Re-exported from next-themes for convenience.
 * Provides access to current theme state and setTheme function.
 * 
 * Returns:
 * - theme: Current theme ('light', 'dark', or 'system')
 * - setTheme: Function to change theme
 * - resolvedTheme: Actual theme being used (resolves 'system' to 'light' or 'dark')
 * - systemTheme: System's current theme preference
 * - themes: Available theme options
 * 
 * Note: Always check if component is mounted before using theme value
 * to avoid hydration mismatches.
 */
export { useTheme } from "next-themes";
