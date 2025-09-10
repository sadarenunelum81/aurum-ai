
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { getTemplateConfigAction, saveTemplateConfigAction, setActiveTemplateAction, uploadImageAction } from '@/app/actions';
import type { TemplateConfig } from '@/types';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function TemplateSection({ templateId, title, description }: { templateId: string, title: string, description: string }) {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<TemplateConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        async function loadConfig() {
            setIsLoading(true);
            const result = await getTemplateConfigAction(templateId);
            if (result.success && result.data) {
                setConfig(result.data);
            } else if (!result.success) {
                 toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
            setIsLoading(false);
        }
        loadConfig();
    }, [templateId, toast]);

    const handleInputChange = (key: string, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };
    
    const handleHeaderChange = (key: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            header: {
                ...prev.header,
                [key]: value
            }
        }));
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const imageDataUri = reader.result as string;
            const result = await uploadImageAction({ imageDataUri });
            if (result.success) {
                handleHeaderChange('logoIconUrl', result.data.imageUrl);
                toast({ title: "Icon uploaded successfully!" });
            } else {
                toast({ variant: 'destructive', title: "Upload failed", description: result.error });
            }
            setIsUploading(false);
        };
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await saveTemplateConfigAction(templateId, config);

        if (result.success) {
            toast({ title: 'Success', description: `${title} settings saved.` });
        } else {
             toast({ variant: 'destructive', title: 'Error saving', description: result.error });
        }
        setIsSaving(false);
    };
    
    const handleActivationToggle = async (checked: boolean) => {
        setIsSaving(true);
        if (checked) {
            const result = await setActiveTemplateAction(templateId);
            if (result.success) {
                setConfig(prev => ({...prev, isActive: true }));
                // This is a bit of a hack to update other cards if they're on the page
                // A more robust solution might use a global state manager (e.g., Zustand, Redux)
                window.dispatchEvent(new CustomEvent('template-activated', { detail: { templateId } }));
                toast({ title: 'Success', description: `${title} is now the active main page template.` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        }
        setIsSaving(false);
    }
    
    // Listen for activation events from other cards
     useEffect(() => {
        const handleTemplateActivated = (event: Event) => {
            const { detail } = event as CustomEvent;
            if (detail.templateId !== templateId) {
                setConfig(prev => ({ ...prev, isActive: false }));
            }
        };

        window.addEventListener('template-activated', handleTemplateActivated);
        return () => window.removeEventListener('template-activated', handleTemplateActivated);
    }, [templateId]);


    if (isLoading) {
        return <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Label htmlFor={`active-switch-${templateId}`} className="text-sm font-medium">Set as Main Page</Label>
                        <Switch
                            id={`active-switch-${templateId}`}
                            checked={config.isActive}
                            onCheckedChange={handleActivationToggle}
                            disabled={isSaving || config.isActive}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor={`custom-path-${templateId}`}>Custom URL Path</Label>
                    <div className="flex items-center">
                        <span className="p-2 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">/</span>
                        <Input
                            id={`custom-path-${templateId}`}
                            placeholder="e.g., tech, travel, pets"
                            value={config.customPath || ''}
                            onChange={(e) => handleInputChange('customPath', e.target.value.replace(/[^a-z0-9-]/g, ''))}
                            className="rounded-l-none"
                        />
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Assign a unique path to this template. Use lowercase letters, numbers, and hyphens only.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="header-settings">
                        <AccordionTrigger className="text-lg font-medium">Header Settings</AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                             <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-4">
                                     {config.header?.logoIconUrl && (
                                        <div className="relative">
                                            <Image src={config.header.logoIconUrl} alt="logo icon" width={40} height={40} className="rounded-full bg-muted p-1" />
                                            <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => handleHeaderChange('logoIconUrl', '')}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <Input 
                                        id="logo-text"
                                        placeholder="Logo Text (e.g., TECHNICA)" 
                                        value={config.header?.logoText || ''}
                                        onChange={(e) => handleHeaderChange('logoText', e.target.value)}
                                    />
                                    <Button asChild variant="outline" size="icon">
                                        <label htmlFor={`logo-icon-upload-${templateId}`} className="cursor-pointer">
                                            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                                            <input id={`logo-icon-upload-${templateId}`} type="file" className="sr-only" onChange={handleIconUpload} accept="image/*" />
                                        </label>
                                    </Button>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="header-bg-color">Header Background Color</Label>
                                    <Input 
                                        id="header-bg-color"
                                        placeholder="#000000 or bg-black" 
                                        value={config.header?.backgroundColor || ''}
                                        onChange={(e) => handleHeaderChange('backgroundColor', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="header-text-color">Header Text Color</Label>
                                    <Input 
                                        id="header-text-color"
                                        placeholder="#FFFFFF or text-white" 
                                        value={config.header?.textColor || ''}
                                        onChange={(e) => handleHeaderChange('textColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="menu-items">Menu Items</Label>
                                <Textarea
                                    id="menu-items"
                                    placeholder="One per line. Format: Name, /path (for pages) or Name, /#section-id (for sections)"
                                    value={config.header?.menuItems || ''}
                                    onChange={(e) => handleHeaderChange('menuItems', e.target.value)}
                                    rows={5}
                                />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subscribe-link">Subscribe Button Link</Label>
                                    <Input 
                                        id="subscribe-link"
                                        placeholder="/subscribe or https://..." 
                                        value={config.header?.subscribeLink || ''}
                                        onChange={(e) => handleHeaderChange('subscribeLink', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-link">Sign In Button Link</Label>
                                    <Input 
                                        id="login-link"
                                        placeholder="/login" 
                                        value={config.header?.loginLink || ''}
                                        onChange={(e) => handleHeaderChange('loginLink', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`theme-toggle-switch-${templateId}`}
                                    checked={config.header?.showThemeToggle}
                                    onCheckedChange={(checked) => handleHeaderChange('showThemeToggle', checked)}
                                />
                                <Label htmlFor={`theme-toggle-switch-${templateId}`}>Show Dark/Light Mode Toggle</Label>
                            </div>

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin" /> : 'Save Settings'}
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function TemplateSetupPage() {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <TemplateSection 
                templateId="tech-template-01"
                title="Tech Template 01"
                description="Configure the settings for the primary technology-focused landing page template."
            />
            {/* Add other template sections here in the future */}
        </div>
    );
}
