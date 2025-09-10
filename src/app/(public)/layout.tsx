
import { ThemeProvider } from "next-themes";
import { getActiveTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';

export default async function PublicLayout({
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

  // The ThemeProvider should wrap only the public-facing children
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
