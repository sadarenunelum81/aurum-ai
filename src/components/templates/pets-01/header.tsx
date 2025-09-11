
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderConfig, TemplateConfig } from '@/types';
import { Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

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

    const headerProps = {
        style: {
            backgroundColor: colors?.backgroundColor,
            color: colors?.textColor,
        }
    };
    
    const subscribeButtonProps = {
        style: {
            backgroundColor: colors?.subscribeButtonBgColor,
            color: colors?.subscribeButtonTextColor,
        }
    };

    const loginButtonProps = {
        style: {
            backgroundColor: colors?.loginButtonBgColor,
            color: colors?.loginButtonTextColor,
        }
    };

    return (
        <>
            {adConfig?.enableTopHeaderAd && <AdPlacement script={adConfig.topHeaderAdScript} />}
            <header 
                className='w-full sticky top-0 z-50 border-b'
                style={headerProps.style}
            >
                <div className='container mx-auto flex items-center justify-between h-16 px-4 md:px-6'>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{color: colors?.textColor}}>
                        {headerConfig.logoIconUrl && (
                            <div className="relative h-10 w-10">
                                <Image src={headerConfig.logoIconUrl} alt="Logo" fill className="rounded-full object-cover" />
                            </div>
                        )}
                        {headerConfig.logoText && <span>{headerConfig.logoText}</span>}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {menuItems.map((item) => (
                            <Link key={item.id} href={item.value} className="transition-colors hover:text-foreground/80" style={{color: colors?.textColor}}>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side controls */}
                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" style={subscribeButtonProps.style}>
                             <Link href={headerConfig.subscribeLink || '#'}>
                                {headerConfig.subscribeButtonText || 'Subscribe'}
                            </Link>
                        </Button>
                        <div className="h-6 w-px bg-border" />
                        
                        <Button variant="ghost" size="icon" style={{color: colors?.textColor}}>
                            <Search className="h-5 w-5" />
                        </Button>
                         <div className="h-6 w-px bg-border" />
                         <Button asChild variant="ghost" size="sm" className='font-semibold' style={loginButtonProps.style}>
                            <Link href={headerConfig.loginLink || '/login'}>
                                {headerConfig.loginButtonText || 'SIGN IN'}
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            {adConfig?.enableUnderHeaderAd && <AdPlacement script={adConfig.underHeaderAdScript} />}
        </>
    );
};
