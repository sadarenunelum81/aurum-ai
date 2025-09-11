
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderConfig, TemplateConfig } from '@/types';
import { Search, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const AdPlacement = ({ script }: { script?: string }) => {
    if (!script) return null;
    return (
        <div 
            className="w-full bg-muted flex items-center justify-center p-2 border-b"
            dangerouslySetInnerHTML={{ __html: script }}
        />
    );
};

export const PetsTemplate01Header = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: TemplateConfig['themeMode'] }) => {
    const { resolvedTheme } = useTheme();

    if (!config?.header) return null;
    
    const headerConfig = config.header;
    const adConfig = config.ads;
    const menuItems = Array.isArray(headerConfig.menuItems) ? headerConfig.menuItems : [];
    
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? headerConfig.darkModeColors : headerConfig.lightModeColors;

    const headerStyle = {
        backgroundColor: colors?.backgroundColor,
        color: colors?.textColor,
    };
    
    const subscribeButtonStyle = {
        backgroundColor: colors?.subscribeButtonBgColor,
        color: colors?.subscribeButtonTextColor,
    };

    const loginButtonStyle = {
        backgroundColor: colors?.loginButtonBgColor,
        color: colors?.loginButtonTextColor,
    };

    return (
        <>
            {adConfig?.enableTopHeaderAd && <AdPlacement script={adConfig.topHeaderAdScript} />}
            <header 
                className='w-full sticky top-0 z-50 border-b'
                style={headerStyle}
            >
                <div className='container mx-auto px-4 md:px-6'>
                    {/* Top Row */}
                    <div className='flex items-center justify-between h-16'>
                        <div className="flex items-center gap-2">
                            {/* Mobile Menu */}
                            <div className="md:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" style={{color: colors?.textColor}}>
                                            <Menu className="h-6 w-6" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left">
                                        <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                                            {menuItems.map((item) => (
                                                <Link key={item.id} href={item.value} className="transition-colors hover:text-foreground/80">
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>
                            <Button variant="ghost" size="icon" style={{color: colors?.textColor}}>
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl absolute left-1/2 -translate-x-1/2" style={{color: colors?.textColor}}>
                            {headerConfig.logoIconUrl && (
                                <div className="relative h-10 w-10">
                                    <Image src={headerConfig.logoIconUrl} alt="Logo" fill className="rounded-full object-cover" />
                                </div>
                            )}
                            {headerConfig.logoText && <span>{headerConfig.logoText}</span>}
                        </Link>
                        
                        <div className="flex items-center gap-2">
                             <Button asChild variant="ghost" size="sm" className='font-semibold' style={loginButtonStyle}>
                                <Link href={headerConfig.loginLink || '/login'}>
                                    {headerConfig.loginButtonText || 'SIGN IN'}
                                </Link>
                            </Button>
                             <Button asChild size="sm" style={subscribeButtonStyle}>
                                 <Link href={headerConfig.subscribeLink || '#'}>
                                    {headerConfig.subscribeButtonText || 'Subscribe'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {/* Bottom Row - Desktop Navigation */}
                    <nav className="hidden md:flex items-center justify-center gap-6 text-sm font-medium h-12 border-t" style={{borderColor: colors?.backgroundColor ? 'rgba(128,128,128,0.2)' : undefined}}>
                        {menuItems.map((item) => (
                            <Link key={item.id} href={item.value} className="transition-colors hover:text-foreground/80 uppercase tracking-wider" style={{color: colors?.textColor}}>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>
            {adConfig?.enableUnderHeaderAd && <AdPlacement script={adConfig.underHeaderAdScript} />}
        </>
    );
};
