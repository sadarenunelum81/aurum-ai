
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAutoBloggerConfig, saveAutoBloggerConfig } from '@/lib/config';
import { uploadImageAction } from '@/app/actions';
import Image from 'next/image';

function ColorInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (value: string) => void, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: value || 'transparent' }} />
                <Input
                    placeholder={placeholder || "#FFFFFF or text-primary"}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}

export default function ProfilePageSetup() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [textColor, setTextColor] = useState('');
    const [overlayColor, setOverlayColor] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');

    useEffect(() => {
        async function loadConfig() {
            setIsLoading(true);
            const config = await getAutoBloggerConfig();
            if (config) {
                // Assuming these fields will be added to AutoBloggerConfig
                setTextColor((config as any).profilePageTextColor || '');
                setOverlayColor((config as any).profilePageOverlayColor || '');
                setBackgroundImage((config as any).profilePageBgImage || '');
            }
            setIsLoading(false);
        }
        loadConfig();
    }, []);

    const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const imageDataUri = reader.result as string;
                const result = await uploadImageAction({ imageDataUri });
                if (result.success) {
                    setBackgroundImage(result.data.imageUrl);
                    toast({ title: 'Success', description: 'Background image uploaded.' });
                } else {
                    throw new Error(result.error);
                }
            };
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const configUpdates = {
                profilePageTextColor: textColor,
                profilePageOverlayColor: overlayColor,
                profilePageBgImage: backgroundImage
            };
            await saveAutoBloggerConfig(configUpdates as any);
            toast({ title: 'Settings Saved', description: 'Profile page styles have been updated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
             <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Page Customization</CardTitle>
                    <CardDescription>Customize the appearance of the user profile page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ColorInput label="Text Color" value={textColor} onChange={setTextColor} placeholder="e.g., #FFFFFF or text-white" />
                    <ColorInput label="Background Overlay Color" value={overlayColor} onChange={setOverlayColor} placeholder="e.g., rgba(0,0,0,0.5)" />
                    <div className="space-y-2">
                        <Label>Background Image</Label>
                        <Input type="file" accept="image/*" onChange={handleBgImageUpload} disabled={isUploading}/>
                        {isUploading && <Loader2 className="animate-spin" />}
                        {backgroundImage && <Image src={backgroundImage} alt="Background preview" width={200} height={120} className="rounded-md mt-2 object-cover" />}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Save Settings
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
