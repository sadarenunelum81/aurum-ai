
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
    // In a real app, you'd wrap your layout in a ThemeProvider.
    // For now, next-themes is not installed, so we mock it to prevent errors.
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
    
    const menuItems = config.menuItems?.split('\n').map(item => {
        const [name, path] = item.split(',').map(s => s.trim());
        return { name, path };
    }).filter(item => item.name && item.path) || [];

    const getStyle = (colorValue?: string) => {
        if (!colorValue) return {};
        if (colorValue.startsWith('#') || colorValue.startsWith('rgb')) {
            return { color: colorValue };
        }
        return {};
    }
    
    const getBgStyle = (colorValue?: string) => {
        if (!colorValue) return {};
        if (colorValue.startsWith('#') || colorValue.startsWith('rgb')) {
            return { backgroundColor: colorValue };
        }
        return {};
    }

    const textColorClass = config.textColor && !config.textColor.startsWith('#') ? config.textColor : '';
    const bgColorClass = config.backgroundColor && !config.backgroundColor.startsWith('#') ? config.backgroundColor : '';
    
    return (
        <header className={cn('w-full sticky top-0 z-50', bgColorClass)} style={getBgStyle(config.backgroundColor)}>
            <div className={cn('container mx-auto flex items-center justify-between h-16 px-4 md:px-6', textColorClass)} style={getStyle(config.textColor)}>
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
                    {menuItems.map((item, index) => (
                        <Link key={index} href={item.path} className="hover:text-primary transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right side controls */}
                <div className="flex items-center gap-4">
                    <Link href={config.subscribeLink || '#'} className="text-sm font-semibold text-green-400 hover:text-green-300">
                        {config.subscribeButtonText || 'Subscribe'}
                    </Link>
                    <div className="h-6 w-px bg-gray-600" />

                    {config.showThemeToggle && <ThemeToggleButton />}
                    
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                    </Button>
                     <div className="h-6 w-px bg-gray-600" />
                    <Link href={config.loginLink || '/login'} className="text-sm font-semibold hover:text-primary">
                        {config.loginButtonText || 'SIGN IN'}
                    </Link>
                </div>
            </div>
        </header>
    );
};

    