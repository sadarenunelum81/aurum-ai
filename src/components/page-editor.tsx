
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Palette, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { getPageConfigAction, savePageConfigAction, uploadImageAction } from '@/app/actions';
import type { PageConfig, PageSection } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: value || 'transparent' }} />
                <Input
                    placeholder="e.g., #FFFFFF or hsl(0, 0%, 100%)"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}

export function PageEditor({ pageId }: { pageId: string }) {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<PageConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const pageTitle = useMemo(() => {
        if (pageId === 'about') return 'About Us';
        if (pageId === 'contact') return 'Contact Us';
        if (pageId === 'privacy') return 'Privacy Policy';
        return 'Page';
    }, [pageId]);

    useEffect(() => {
        async function loadPageConfig() {
            setIsLoading(true);
            const result = await getPageConfigAction(pageId);
            if (result.success && result.data) {
                setConfig(result.data);
            } else {
                // Initialize with default structure if not found
                setConfig({
                    id: pageId,
                    title: pageTitle,
                    content: '',
                    sections: [],
                    lightTheme: {},
                    darkTheme: {},
                    contactDetails: { email: '', whatsapp: '', telegram: '' }
                });
            }
            setIsLoading(false);
        }
        loadPageConfig();
    }, [pageId, pageTitle]);

    const handleInputChange = (field: keyof PageConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleThemeChange = (theme: 'lightTheme' | 'darkTheme', field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            [theme]: { ...(prev[theme] || {}), [field]: value }
        }));
    };
    
    const handleContactChange = (field: 'email' | 'whatsapp' | 'telegram', value: string) => {
        setConfig(prev => ({
            ...prev,
            contactDetails: { ...(prev.contactDetails || {}), [field]: value }
        }));
    };

    const addSection = () => {
        const newSection: PageSection = { id: `sec-${Date.now()}`, title: '', content: '' };
        handleInputChange('sections', [...(config.sections || []), newSection]);
    };

    const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
        const updatedSections = [...(config.sections || [])];
        updatedSections[index] = { ...updatedSections[index], [field]: value };
        handleInputChange('sections', updatedSections);
    };

    const removeSection = (id: string) => {
        handleInputChange('sections', config.sections?.filter(sec => sec.id !== id));
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const imageDataUri = reader.result as string;
            const result = await uploadImageAction({ imageDataUri });
            if (result.success) {
                handleInputChange('backgroundImage', result.data.imageUrl);
                toast({ title: "Image uploaded successfully!" });
            } else {
                toast({ variant: 'destructive', title: "Upload failed", description: result.error });
            }
        };
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await savePageConfigAction(pageId, config);
        if (result.success) {
            toast({ title: 'Success', description: `${pageTitle} page has been saved.` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editing: {pageTitle}</CardTitle>
                    <CardDescription>Manage the content and appearance of your {pageTitle} page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="page-title">Main Title</Label>
                        <Input id="page-title" value={config.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="main-content">Main Content</Label>
                        <Textarea id="main-content" value={config.content || ''} onChange={(e) => handleInputChange('content', e.target.value)} rows={6} />
                    </div>

                    {pageId === 'contact' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-medium">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={config.contactDetails?.email || ''} onChange={(e) => handleContactChange('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp Number</Label>
                                    <Input value={config.contactDetails?.whatsapp || ''} onChange={(e) => handleContactChange('whatsapp', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telegram Handle</Label>
                                    <Input value={config.contactDetails?.telegram || ''} onChange={(e) => handleContactChange('telegram', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {(pageId === 'about' || pageId === 'privacy') && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex justify-between items-center">
                               <h3 className="font-medium">Additional Sections</h3>
                               <Button size="sm" variant="outline" onClick={addSection}><Plus className="mr-2 h-4 w-4" /> Add Section</Button>
                            </div>
                            <div className="space-y-4">
                                {config.sections?.map((section, index) => (
                                    <div key={section.id} className="space-y-2 p-3 border rounded-md relative">
                                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => removeSection(section.id)}><Trash2 className="h-4 w-4" /></Button>
                                        <Label>Section Title</Label>
                                        <Input value={section.title} onChange={(e) => handleSectionChange(index, 'title', e.target.value)} />
                                        <Label>Section Content</Label>
                                        <Textarea value={section.content} onChange={(e) => handleSectionChange(index, 'content', e.target.value)} rows={5} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Accordion type="multiple" className="w-full space-y-6">
                <Card>
                    <AccordionItem value="theme" className="border-0">
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <Palette className="h-5 w-5" />
                                Theme &amp; Style
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-medium">Light Theme</h4>
                                    <ColorInput label="Background Color" value={config.lightTheme?.backgroundColor || ''} onChange={v => handleThemeChange('lightTheme', 'backgroundColor', v)} />
                                    <ColorInput label="Title Color" value={config.lightTheme?.titleColor || ''} onChange={v => handleThemeChange('lightTheme', 'titleColor', v)} />
                                    <ColorInput label="Text Color" value={config.lightTheme?.textColor || ''} onChange={v => handleThemeChange('lightTheme', 'textColor', v)} />
                                    <ColorInput label="Overlay Color (for image)" value={config.lightTheme?.overlayColor || ''} onChange={v => handleThemeChange('lightTheme', 'overlayColor', v)} />
                                </div>
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-medium">Dark Theme</h4>
                                    <ColorInput label="Background Color" value={config.darkTheme?.backgroundColor || ''} onChange={v => handleThemeChange('darkTheme', 'backgroundColor', v)} />
                                    <ColorInput label="Title Color" value={config.darkTheme?.titleColor || ''} onChange={v => handleThemeChange('darkTheme', 'titleColor', v)} />
                                    <ColorInput label="Text Color" value={config.darkTheme?.textColor || ''} onChange={v => handleThemeChange('darkTheme', 'textColor', v)} />
                                    <ColorInput label="Overlay Color (for image)" value={config.darkTheme?.overlayColor || ''} onChange={v => handleThemeChange('darkTheme', 'overlayColor', v)} />
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Background Image</Label>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                                {config.backgroundImage && <img src={config.backgroundImage} alt="preview" className="w-32 h-20 object-cover rounded-md mt-2 border" />}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                 <Card>
                    <AccordionItem value="paths" className="border-0">
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <LinkIcon className="h-5 w-5" />
                                Custom Paths
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Custom Path (Light Mode)</Label>
                                    <Input value={config.customPathLight || ''} onChange={(e) => handleInputChange('customPathLight', e.target.value.replace(/[^a-z0-9-]/g, ''))} placeholder="e.g., about-us" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Custom Path (Dark Mode)</Label>
                                    <Input value={config.customPathDark || ''} onChange={(e) => handleInputChange('customPathDark', e.target.value.replace(/[^a-z0-9-]/g, ''))} placeholder="e.g., about-dark" />
                                </div>
                             </div>
                             <p className="text-xs text-muted-foreground">Assign a unique path to access this page. Use only lowercase letters, numbers, and hyphens.</p>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>
            </Accordion>
            
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Changes
                </Button>
            </div>
        </div>
    );
}

    