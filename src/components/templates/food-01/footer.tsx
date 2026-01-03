
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { TemplateConfig } from '@/types';

export const FoodTemplate01Footer = ({ config, themeMode }: { config?: TemplateConfig; themeMode?: 'light' | 'dark' }) => {
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
        backgroundImage: colors?.backgroundColor?.startsWith('http') ? `url(${colors.backgroundColor})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    const overlayStyle = { backgroundColor: colors?.overlayColor };

    const socialIcons = [
        { Icon: Facebook, href: footerConfig.socialLinks?.facebook },
        { Icon: Twitter, href: footerConfig.socialLinks?.twitter },
        { Icon: Instagram, href: footerConfig.socialLinks?.instagram },
        { Icon: Youtube, href: footerConfig.socialLinks?.linkedin }, // Using linkedin for youtube for now
        { Icon: Pinterest, href: footerConfig.socialLinks?.linkedin }, // Using linkedin for pinterest for now
    ];

    return (
        <footer className="relative font-body" style={containerStyle}>
            {overlayStyle.backgroundColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 py-16 relative z-10">
                <div className="flex flex-col items-center text-center">
                    {headerConfig?.logoIconUrl || headerConfig?.logoText ? (
                        <Link href="/" className="flex items-center gap-3 font-bold text-3xl font-headline mb-6" style={{color: colors?.titleColor}}>
                            {headerConfig.logoIconUrl && (
                                <div className="relative h-10 w-10">
                                    <Image src={headerConfig.logoIconUrl} alt="Logo" fill className="rounded-full object-cover" />
                                </div>
                            )}
                            {headerConfig.logoText && <span>{headerConfig.logoText}</span>}
                        </Link>
                    ) : null}

                    {footerConfig.aboutText && <p className="text-sm max-w-2xl mx-auto mb-8" style={{color: colors?.textColor}}>{footerConfig.aboutText}</p>}

                    <div className="flex items-center gap-6 mb-8">
                        {socialIcons.map(({ Icon, href }, index) =>
                            href ? (
                                <Link key={index} href={href} target="_blank" rel="noopener noreferrer">
                                    <Icon className="h-6 w-6 transition-colors hover:text-primary" style={{ color: colors?.linkColor }} />
                                </Link>
                            ) : null
                        )}
                    </div>
                </div>

                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8">
                    {footerConfig.menuColumns?.flatMap(col => col.links).map(link => (
                         <Link key={link.id} href={link.value} className="text-sm font-semibold hover:underline" style={{ color: colors?.linkColor }}>
                            {link.name}
                        </Link>
                    ))}
                </div>


                {/* Copyright Section */}
                <div className="mt-12 pt-8 border-t text-center" style={{borderColor: colors?.lineColor}}>
                    <p className="text-xs" style={{ color: colors?.copyrightTextColor }}>
                        {footerConfig.copyrightText}
                    </p>
                </div>
            </div>
        </footer>
    );
};
