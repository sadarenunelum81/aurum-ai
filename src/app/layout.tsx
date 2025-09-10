
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getActiveTemplate } from '@/lib/templates';
import type { TemplateConfig } from '@/types';

function ThemeManager({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');
    const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdminRoute) {
            getActiveTemplate().then(template => {
                setTemplateConfig(template);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [pathname, isAdminRoute]);

    if (loading) {
        return null; // Or a loading spinner
    }

    let themeProps = {
        defaultTheme: "dark",
        enableSystem: false,
        forcedTheme: undefined as 'light' | 'dark' | undefined,
    };
    
    if (isAdminRoute) {
        themeProps.forcedTheme = 'dark';
    } else if (templateConfig?.id) {
        themeProps.forcedTheme = templateConfig.themeMode;
        themeProps.enableSystem = false;
    }
    
    return (
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            {...themeProps}
        >
            {children}
        </ThemeProvider>
    );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AurumAI</title>
        <meta name="description" content="AI-Powered Auto Blogger System" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
            <AuthProvider>
                <ThemeManager>
                    {children}
                </ThemeManager>
            </AuthProvider>
            <Toaster />
      </body>
    </html>
  );
}
