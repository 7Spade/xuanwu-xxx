
import type {Metadata} from 'next';
import '../styles/globals.css';
import {Toaster} from '@/shared/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/shared/utils/utils';
import { ThemeProvider } from '@/shared/context/theme-context';
import { FirebaseClientProvider } from '@/shared/context/firebase-context';
import { AuthProvider } from '@/shared/context/auth-context';
import { AppProvider } from '@/context/app-context';
import { I18nProvider } from '@/shared/context/i18n-context';

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
