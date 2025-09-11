
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import type { TemplateConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const PoliticsTemplate01Footer = ({ config, themeMode }: { config?: TemplateConfig; themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const footerConfig = config?.footer;
    const headerConfig = config?.header;

    if (!footerConfig?.enabled) {
        return null;
    }

    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? footerConfig.darkModeColors : footerConfig.lightModeColors;
    
    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
    };
    
    const socialIcons = [
        { Icon: Facebook, href: footerConfig.socialLinks?.facebook },
        { Icon: Twitter, href: footerConfig.socialLinks?.twitter },
        { Icon: Instagram, href: footerConfig.socialLinks?.instagram },
        { Icon: Linkedin, href: footerConfig.socialLinks?.linkedin },
    ];

    return (
        <footer className="relative border-t" style={containerStyle}>
            <div className="container mx-auto px-4 md:px-6">
                 <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                         <h2 className="text-2xl font-bold font-headline mb-2" style={{color: colors?.titleColor}}>{footerConfig.newsletterTitle || 'Subscribe to our Newsletter'}</h2>
                         <p className="text-muted-foreground mb-6" style={{color: colors?.textColor}}>{footerConfig.newsletterDescription || 'Get the latest political news, analysis, and updates delivered to your inbox.'}</p>
                    </div>
                     <form className="flex w-full max-w-md">
                         <Input type="email" placeholder="Enter your email" className="rounded-r-none focus:ring-0 focus:ring-offset-0" />
                         <Button type="submit" className="rounded-l-none" style={{backgroundColor: colors?.subscribeButtonBgColor, color: colors?.subscribeButtonTextColor}}>{footerConfig.subscribeButtonText || 'Subscribe'}</Button>
                     </form>
                </div>

                <div className="border-t py-12" style={{borderColor: colors?.lineColor}}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-4 lg:col-span-3">
                            {headerConfig?.logoIconUrl || headerConfig?.logoText ? (
                                <Link href="/" className="flex items-center gap-3 font-bold text-2xl mb-4" style={{color: colors?.titleColor}}>
                                    {headerConfig.logoIconUrl && (
                                        <div className="relative h-10 w-10">
                                            <Image src={headerConfig.logoIconUrl} alt="Logo" fill className="rounded-md object-contain" />
                                        </div>
                                    )}
                                    {headerConfig.logoText && <span>{headerConfig.logoText}</span>}
                                </Link>
                            ) : null}
                            {footerConfig.aboutText && <p className="text-sm text-muted-foreground" style={{color: colors?.textColor}}>{footerConfig.aboutText}</p>}
                        </div>
                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-8">
                            {footerConfig.menuColumns?.map(column => (
                                <div key={column.id}>
                                    <h3 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: colors?.titleColor }}>{column.title}</h3>
                                    <ul className="space-y-3">
                                        {column.links?.map(link => (
                                            <li key={link.id}>
                                                <Link href={link.value} className="text-sm text-muted-foreground hover:text-primary" style={{ color: colors?.linkColor }}>
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="py-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4" style={{borderColor: colors?.lineColor}}>
                     <div className="flex items-center gap-4">
                        {socialIcons.map(({ Icon, href }, index) => 
                            href ? (
                                <Button asChild key={index} variant="ghost" size="icon" className="h-8 w-8">
                                    <Link href={href} target="_blank" rel="noopener noreferrer">
                                        <Icon className="h-5 w-5 text-muted-foreground" style={{ color: colors?.linkColor }} />
                                    </Link>
                                </Button>
                            ) : null
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center sm:text-left" style={{ color: colors?.copyrightTextColor }}>
                        {footerConfig.copyrightText}
                    </p>
                </div>
            </div>
        </footer>
    );
};

    