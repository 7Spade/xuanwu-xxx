
import type {Metadata} from 'next';
import '../styles/globals.css';
import {Toaster} from '@/shared/shadcn-ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/shared/lib';
import { ThemeProvider } from '@/shared/app-providers/theme-provider';
import { FirebaseClientProvider } from '@/shared/app-providers/firebase-provider';
import { AuthProvider } from '@/shared/app-providers/auth-provider';
import { AppProvider } from '@/features/workspace-core';
import { I18nProvider } from '@/shared/app-providers/i18n-provider';

export const metadata: Metadata = {
  title: 'OrgVerse | Modern Workspace Architecture',
  description: 'From Single Identity to Multidimensional Organization',
};

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, 'font-sans', 'antialiased', 'min-h-screen', 'bg-background')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <FirebaseClientProvider>
              <AuthProvider>
                <AppProvider>
                  {children}
                  <Toaster />
                </AppProvider>
              </AuthProvider>
            </FirebaseClientProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
