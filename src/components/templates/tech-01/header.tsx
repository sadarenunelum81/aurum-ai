
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderConfig } from '@/types';
import { Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

// A simple theme toggle button
const ThemeToggleButton = () => {
    const { theme, setTheme } = useTheme();

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export const TechTemplate01Header = ({ config }: { config?: HeaderConfig }) => {
    const { theme } = useTheme();

    if (!config) return null;
    
    const menuItems = Array.isArray(config.menuItems) ? config.menuItems : [];
    
    const isDark = theme === 'dark';

    const getStyle = (lightClass: string, darkVariable?: string) => {
        if (isDark && darkVariable) {
            return { style: { backgroundColor: darkVariable } };
        }
        return { className: lightClass };
    };

    const getTextStyle = (lightClass: string, darkVariable?: string) => {
        if (isDark && darkVariable) {
            return { style: { color: darkVariable } };
        }
        return { className: lightClass };
    };

    const headerProps = isDark 
        ? { style: { backgroundColor: config.backgroundColor, color: config.textColor } }
        : {};

    const subscribeButtonProps = isDark
        ? { style: { backgroundColor: config.subscribeButtonBgColor, color: config.subscribeButtonTextColor } }
        : {};

    const loginButtonProps = isDark
        ? { style: { backgroundColor: config.loginButtonBgColor, color: config.loginButtonTextColor } }
        : {};

    return (
        <header 
            className={cn(
                'w-full sticky top-0 z-50 border-b',
                !isDark && 'bg-tech-header text-tech-header-text'
            )}
            {...headerProps}
        >
            <div className='container mx-auto flex items-center justify-between h-16 px-4 md:px-6'>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl" {...(isDark ? {style: {color: config.textColor}} : {})}>
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
                        <Link key={item.id} href={item.value} className={cn("transition-colors", !isDark && "hover:text-primary", isDark && "hover:text-gray-300")} {...(isDark ? {style: {color: config.textColor}} : {})}>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right side controls */}
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className={cn(!isDark && "bg-tech-subscribe-button text-tech-subscribe-button-text hover:bg-tech-subscribe-button/90")} {...subscribeButtonProps}>
                         <Link href={config.subscribeLink || '#'}>
                            {config.subscribeButtonText || 'Subscribe'}
                        </Link>
                    </Button>
                    <div className="h-6 w-px bg-border" />

                    {config.showThemeToggle && <ThemeToggleButton />}
                    
                    <Button variant="ghost" size="icon" {...(isDark ? {style: {color: config.textColor}} : {})}>
                        <Search className="h-5 w-5" />
                    </Button>
                     <div className="h-6 w-px bg-border" />
                     <Button asChild variant="ghost" size="sm" className={cn('font-semibold', !isDark && 'text-tech-login-button-text bg-tech-login-button hover:bg-tech-login-button/90')} {...loginButtonProps}>
                        <Link href={config.loginLink || '/login'}>
                            {config.loginButtonText || 'SIGN IN'}
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
};
