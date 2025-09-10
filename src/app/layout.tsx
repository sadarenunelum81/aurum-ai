import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from "next-themes";
import { getActiveTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'AurumAI',
  description: 'AI-Powered Auto Blogger System',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTemplate = await getActiveTemplate();
  
  let themeMode = activeTemplate?.themeMode || 'both';
  let defaultTheme = activeTemplate?.defaultTheme || 'system';
  let forcedTheme: 'light' | 'dark' | undefined = undefined;

  if (themeMode === 'light-only') {
    forcedTheme = 'light';
  } else if (themeMode === 'dark-only') {
    forcedTheme = 'dark';
  }

  return (
    <html lang="en" suppressHydrationWarning className={cn(forcedTheme && forcedTheme)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
           <ThemeProvider
            attribute="class"
            defaultTheme={defaultTheme}
            enableSystem
            disableTransitionOnChange
            forcedTheme={forcedTheme}
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
