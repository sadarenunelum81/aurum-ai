
"use client";

// This is a placeholder for the Sports Template Header.
// You can start building your unique header component here.

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { TemplateConfig } from '@/types';
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

export const SportsTemplate01Header = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: TemplateConfig['themeMode'] }) => {
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
                    <div className='flex items-center justify-between h-20'>
                        <div className="lg:hidden">
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
                        <Link href="/" className="flex items-center gap-3 font-bold text-2xl font-headline" style={{color: colors?.textColor}}>
                            {headerConfig.logoIconUrl && (
                                <div className="relative h-10 w-10">
                                    <Image src={headerConfig.logoIconUrl} alt="Logo" fill className="rounded-md object-contain" />
                                </div>
                            )}
                            {headerConfig.logoText && <span>{headerConfig.logoText}</span>}
                        </Link>
                        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
                            {menuItems.map((item) => (
                                <Link key={item.id} href={item.value} className="flex items-center gap-1 transition-colors hover:text-primary" style={{color: colors?.textColor}}>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center gap-2">
                             <Button asChild size="sm" className='hidden sm:flex' style={subscribeButtonStyle}>
                                 <Link href={headerConfig.subscribeLink || '#'}>
                                    {headerConfig.subscribeButtonText || 'Subscribe'}
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9" style={{color: colors?.textColor}}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            {adConfig?.enableUnderHeaderAd && <AdPlacement script={adConfig.underHeaderAdScript} />}
        </>
    );
};
