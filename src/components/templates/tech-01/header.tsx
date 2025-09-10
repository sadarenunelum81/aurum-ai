
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderConfig } from '@/types';
import { Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes'; 

// A simple theme toggle button
const ThemeToggleButton = () => {
    const { theme, setTheme } = useTheme() || { theme: 'dark', setTheme: (t: string) => console.log(`Set theme to ${t}`) };

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export const TechTemplate01Header = ({ config }: { config?: HeaderConfig }) => {
    if (!config) return null;
    
    const menuItems = Array.isArray(config.menuItems) ? config.menuItems : [];
    
    return (
        <header 
            className='w-full sticky top-0 z-50 border-b bg-tech-header text-tech-header-text'
        >
            <div className='container mx-auto flex items-center justify-between h-16 px-4 md:px-6'>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    {config.logoIconUrl && (
                        <div className="relative h-10 w-10">
                            <Image src={config.logoIconUrl} alt="Logo" fill className="rounded-full object-cover" />
                        </div>
                    )}
                    {config.logoText && <span>{config.logoText}</span>}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {menuItems.map((item) => (
                        <Link key={item.id} href={item.value} className="hover:text-primary transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right side controls */}
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="bg-tech-header-button-subscribe text-tech-header-button-subscribe-text hover:bg-tech-header-button-subscribe/90">
                         <Link href={config.subscribeLink || '#'}>
                            {config.subscribeButtonText || 'Subscribe'}
                        </Link>
                    </Button>
                    <div className="h-6 w-px bg-border" />

                    {config.showThemeToggle && <ThemeToggleButton />}
                    
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                    </Button>
                     <div className="h-6 w-px bg-border" />
                     <Button asChild variant="ghost" size="sm" className="bg-tech-header-button-login text-tech-header-button-login-text hover:bg-tech-header-button-login/90 font-semibold">
                        <Link href={config.loginLink || '/login'}>
                            {config.loginButtonText || 'SIGN IN'}
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
};
