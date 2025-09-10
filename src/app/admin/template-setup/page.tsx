
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getTemplateConfigAction, saveTemplateConfigAction, setActiveTemplateAction } from '@/app/actions';
import type { TemplateConfig } from '@/types';

function TemplateSection({ templateId, title, description }: { templateId: string, title: string, description: string }) {
    const { toast } = useToast();
    const [config, setConfig] = useState<TemplateConfig | null>(null);
    const [customPath, setCustomPath] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadConfig() {
            setIsLoading(true);
            const result = await getTemplateConfigAction(templateId);
            if (result.success && result.data) {
                setConfig(result.data);
                setCustomPath(result.data.customPath || '');
                setIsActive(result.data.isActive || false);
            } else if (!result.success) {
                 toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
            setIsLoading(false);
        }
        loadConfig();
    }, [templateId, toast]);
    
    const handleSave = async () => {
        setIsSaving(true);
        const newConfig: Partial<TemplateConfig> = { customPath };
        const result = await saveTemplateConfigAction(templateId, newConfig);

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
                setIsActive(true);
                toast({ title: 'Success', description: `${title} is now the active main page template.` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        }
        // Note: You can't "deactivate" a template this way, only activate another one.
        // The logic in setActiveTemplateAction handles deactivating the old one.
        setIsSaving(false);
    }

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
                            checked={isActive}
                            onCheckedChange={handleActivationToggle}
                            disabled={isSaving || isActive}
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
                            value={customPath}
                            onChange={(e) => setCustomPath(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                            className="rounded-l-none"
                        />
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Assign a unique path to this template. Use lowercase letters, numbers, and hyphens only.
                    </p>
                </div>
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
