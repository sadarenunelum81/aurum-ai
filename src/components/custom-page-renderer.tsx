
"use client";

import type { PageConfig } from "@/types";
import { useTheme } from "next-themes";
import Image from "next/image";

function renderBlock(block: PageConfig['blocks'][0]) {
    switch (block.type) {
        case 'heading':
            return <h2 className="text-3xl font-bold font-headline mt-8 mb-4">{block.content}</h2>;
        case 'paragraph':
            return <p className="leading-relaxed">{block.content}</p>;
        case 'image':
            return (
                <div className="relative aspect-video w-full max-w-2xl mx-auto my-8">
                    <Image src={block.content} alt="Custom page content" fill className="rounded-lg object-contain" />
                </div>
            );
        case 'html':
            return <div dangerouslySetInnerHTML={{ __html: block.content }} />;
        default:
            return null;
    }
}

export function CustomPageRenderer({ config }: { config: PageConfig }) {
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
                        {config.blocks.map(block => (
                            <div key={block.id}>{renderBlock(block)}</div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
