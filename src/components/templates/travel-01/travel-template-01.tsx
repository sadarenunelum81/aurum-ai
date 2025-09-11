
import type { TemplateConfig } from "@/types";

export const TravelTemplate01 = async ({ config, theme }: { config: TemplateConfig, theme: 'light' | 'dark' }) => {

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold font-headline mb-2">Travel Template 01</h1>
                <p className="text-muted-foreground">Ready to be built.</p>
            </div>
        </div>
    );
};
