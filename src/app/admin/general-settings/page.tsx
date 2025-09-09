
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveAutoBloggerConfigAction, getAutoBloggerConfigAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AutoBloggerConfig } from '@/types';

export default function GeneralSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [titleColor, setTitleColor] = useState('');
    const [contentColor, setContentColor] = useState('');

    useEffect(() => {
        async function loadConfig() {
            setIsLoading(true);
            const result = await getAutoBloggerConfigAction();
            if (result.success && result.data) {
                const config = result.data;
                setTitleColor(config.postTitleColor || '');
                setContentColor(config.postContentColor || '');
            } else if (result.error) {
                 toast({
                    variant: 'destructive',
                    title: 'Failed to load settings',
                    description: result.error,
                });
            }
            setIsLoading(false);
        }
        loadConfig();
    }, [toast]);

    const handleSave = async () => {
        setIsSaving(true);

        const configUpdates: Partial<AutoBloggerConfig> = {
            postTitleColor: titleColor,
            postContentColor: contentColor,
        };
        
        // This is a bit of a hack, we need to pass the whole config type
        const result = await saveAutoBloggerConfigAction(configUpdates as AutoBloggerConfig);

        if (result.success) {
            toast({
                title: 'Settings Saved',
                description: 'Your general settings have been saved successfully.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error Saving Settings',
                description: result.error,
            });
        }
        setIsSaving(false);
    };
    
    if (isLoading) {
         return (
             <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
             </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Customize the look and feel of your blog posts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Post Colors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-2">
                                <Label htmlFor="title-color">Post Title Color</Label>
                                <Input 
                                    id="title-color"
                                    type="text"
                                    placeholder="e.g., #FFFFFF or text-primary" 
                                    value={titleColor}
                                    onChange={(e) => setTitleColor(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Enter a hex code or a Tailwind color class.</p>
                                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: titleColor.startsWith('#') ? titleColor : 'transparent' }} />
                            </div>
                             
                             <div className="space-y-2">
                                <Label htmlFor="content-color">Post Content Color</Label>
                                <Input 
                                    id="content-color"
                                    type="text"
                                    placeholder="e.g., #E2E8F0 or text-slate-200" 
                                    value={contentColor}
                                    onChange={(e) => setContentColor(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Enter a hex code or a Tailwind color class.</p>
                                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: contentColor.startsWith('#') ? contentColor : 'transparent' }} />
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : "Save Settings"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
