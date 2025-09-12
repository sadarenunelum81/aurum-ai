"use client";

import type { PageConfig } from "@/types";
import { useTheme } from "next-themes";

export function MainPagesRenderer({ config }: { config: PageConfig }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const themeColors = isDark ? config.darkTheme : config.lightTheme;

    const pageStyle = {
        backgroundColor: themeColors?.backgroundColor || 'transparent',
        color: themeColors?.textColor || 'inherit',
        backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    };

    const titleStyle = {
        color: themeColors?.titleColor || 'inherit',
    };
    
    const overlayStyle = {
        backgroundColor: themeColors?.overlayColor || 'transparent'
    };

    return (
        <div style={pageStyle} className="relative min-h-screen">
            <div className="absolute inset-0" style={overlayStyle} />
            <main className="relative z-10 container mx-auto px-4 py-16">
                 <div className="max-w-4xl mx-auto bg-background/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold font-headline" style={titleStyle}>
                            {config.title}
                        </h1>
                    </header>
                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        {config.content && <p>{config.content}</p>}
                        {config.sections?.map(section => (
                             <div key={section.id} className="pt-6">
                                <h2 className="text-2xl font-bold font-headline" style={titleStyle}>{section.title}</h2>
                                <p>{section.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
