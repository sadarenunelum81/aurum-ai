
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Pilcrow, Image as ImageIcon, Heading, Code, Palette, Link as LinkIcon } from "lucide-react";
import type { PageConfig, ContentBlock } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { savePageConfigAction, uploadImageAction, getPageConfigAction } from '@/app/actions';
import Image from 'next/image';
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

export function PageBuilder({ pageId }: { pageId?: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!pageId);
    
    const [config, setConfig] = useState<Partial<PageConfig>>({
        title: '',
        path: '',
        blocks: [],
        lightTheme: {},
        darkTheme: {}
    });

    useEffect(() => {
        if (pageId) {
            const fetchPage = async () => {
                const result = await getPageConfigAction(pageId);
                if (result.success && result.data) {
                    setConfig(result.data);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to load page data.' });
                    router.push('/admin/custom-pages');
                }
                setIsLoading(false);
            };
            fetchPage();
        }
    }, [pageId, router, toast]);

    const handleBlockChange = (id: string, newContent: string) => {
        setConfig(prev => ({
            ...prev,
            blocks: prev.blocks?.map(block => block.id === id ? { ...block, content: newContent } : block)
        }));
    };

    const addBlock = (type: ContentBlock['type'], index: number, content: string = '') => {
        const newBlock: ContentBlock = { id: `${type[0]}${Date.now()}`, type, content };
        const newBlocks = [...(config.blocks || [])];
        newBlocks.splice(index + 1, 0, newBlock);
        setConfig(prev => ({ ...prev, blocks: newBlocks }));
    };

    const handleImageUpload = async (file: File, index: number) => {
         if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const imageDataUri = reader.result as string;
            const result = await uploadImageAction({ imageDataUri });
            if (result.success) {
                addBlock('image', index, result.data.imageUrl);
                toast({ title: 'Success', description: `Image uploaded and inserted.` });
            } else {
                toast({ variant: 'destructive', title: 'Upload Failed', description: result.error });
            }
        };
    };

    const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const imageDataUri = reader.result as string;
            const result = await uploadImageAction({ imageDataUri });
            if (result.success) {
                setConfig(prev => ({...prev, backgroundImage: result.data.imageUrl}));
                toast({ title: "Background image uploaded!" });
            } else {
                toast({ variant: 'destructive', title: "Upload failed", description: result.error });
            }
        };
    };

    const removeBlock = (id: string) => {
        setConfig(prev => ({
            ...prev,
            blocks: prev.blocks?.filter(block => block.id !== id)
        }));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...(config.blocks || [])];
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === newBlocks.length - 1) return;
        const block = newBlocks[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        newBlocks[index] = newBlocks[swapIndex];
        newBlocks[swapIndex] = block;
        setConfig(prev => ({ ...prev, blocks: newBlocks }));
    };
    
    const handleSave = async () => {
        const id = pageId || config.path?.toLowerCase().replace(/\s+/g, '-');
        if (!config.title || !id) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a title and a URL path.' });
            return;
        }

        setIsSaving(true);
        const result = await savePageConfigAction(id, { ...config, id });

        if (result.success) {
            toast({ title: 'Page Saved', description: 'Your custom page has been saved.' });
            router.push('/admin/custom-pages');
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.error });
        }
        setIsSaving(false);
    };
    
    if (isLoading) {
        return <div className="flex-1 p-4 md:p-6 lg:p-8"><Card><CardHeader><CardTitle>Loading Page Builder...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card></Card></div>
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{pageId ? `Editing: ${config.title}` : 'Create a New Custom Page'}</CardTitle>
                    <CardDescription>Use the block editor to build your page content and configure styles below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="page-title">Page Title</Label>
                           <Input id="page-title" value={config.title} onChange={(e) => setConfig(p => ({...p, title: e.target.value}))} placeholder="e.g., Our Services" />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="page-path">URL Path (Identifier)</Label>
                           <div className="flex items-center">
                               <span className="p-2 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">/</span>
                               <Input 
                                   id="page-path" 
                                   value={config.path} 
                                   onChange={(e) => setConfig(p => ({...p, path: e.target.value.replace(/[^a-z0-9-]/g, '')}))} 
                                   placeholder="e.g., our-services" 
                                   className="rounded-l-none"
                                   disabled={!!pageId}
                                />
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-base font-medium">Content Blocks</Label>
                        <div className="space-y-4 rounded-md border p-4 min-h-[200px] bg-background">
                             {(config.blocks || []).map((block, index) => (
                                <div key={block.id} className="group relative pt-8">
                                    <div className="absolute top-0 right-0 flex items-center bg-card rounded-md border p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(index, 'down')} disabled={index === (config.blocks?.length || 0) - 1}>
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeBlock(block.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {block.type === 'paragraph' && <Textarea value={block.content} onChange={(e) => handleBlockChange(block.id, e.target.value)} placeholder="Start writing..." className="text-base min-h-[100px]" />}
                                    {block.type === 'heading' && <Input value={block.content} onChange={(e) => handleBlockChange(block.id, e.target.value)} placeholder="Heading title..." className="text-2xl font-bold h-auto p-2 border-dashed" />}
                                    {block.type === 'html' && <Textarea value={block.content} onChange={(e) => handleBlockChange(block.id, e.target.value)} placeholder="<p>Your HTML code here</p>" className="text-base min-h-[120px] font-mono bg-muted" />}
                                    {block.type === 'image' && <div className="relative aspect-video w-full max-w-md mx-auto"><Image src={block.content} alt="Custom page image" fill className="rounded-md object-contain border" /></div>}
                                    
                                     <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-1 p-1 rounded-full border bg-card shadow-sm">
                                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => addBlock('heading', index)}><Heading className="mr-2 h-4 w-4"/> Add Heading</Button>
                                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => addBlock('paragraph', index)}><Pilcrow className="mr-2 h-4 w-4"/> Add Paragraph</Button>
                                            <input type="file" id={`image-upload-${index}`} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], index)} />
                                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => document.getElementById(`image-upload-${index}`)?.click()}><ImageIcon className="mr-2 h-4 w-4"/> Add Image</Button>
                                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => addBlock('html', index)}><Code className="mr-2 h-4 w-4"/> Add HTML</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!config.blocks || config.blocks.length === 0) && (
                                <div className="text-center py-10">
                                    <Button size="sm" onClick={() => addBlock('paragraph', -1)}>
                                        <Plus className="mr-2 h-4 w-4"/> Add First Block
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Accordion type="multiple" className="w-full space-y-6">
                <Card>
                    <AccordionItem value="theme" className="border-0">
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <Palette className="h-5 w-5" />
                                Theme & Style
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-medium">Light Theme</h4>
                                    <ColorInput label="Background Color" value={config.lightTheme?.backgroundColor || ''} onChange={v => setConfig(p => ({...p, lightTheme: {...p.lightTheme, backgroundColor: v}}))} />
                                    <ColorInput label="Title Color" value={config.lightTheme?.titleColor || ''} onChange={v => setConfig(p => ({...p, lightTheme: {...p.lightTheme, titleColor: v}}))} />
                                    <ColorInput label="Text Color" value={config.lightTheme?.textColor || ''} onChange={v => setConfig(p => ({...p, lightTheme: {...p.lightTheme, textColor: v}}))} />
                                    <ColorInput label="Overlay Color (for image)" value={config.lightTheme?.overlayColor || ''} onChange={v => setConfig(p => ({...p, lightTheme: {...p.lightTheme, overlayColor: v}}))} />
                                </div>
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-medium">Dark Theme</h4>
                                    <ColorInput label="Background Color" value={config.darkTheme?.backgroundColor || ''} onChange={v => setConfig(p => ({...p, darkTheme: {...p.darkTheme, backgroundColor: v}}))} />
                                    <ColorInput label="Title Color" value={config.darkTheme?.titleColor || ''} onChange={v => setConfig(p => ({...p, darkTheme: {...p.darkTheme, titleColor: v}}))} />
                                    <ColorInput label="Text Color" value={config.darkTheme?.textColor || ''} onChange={v => setConfig(p => ({...p, darkTheme: {...p.darkTheme, textColor: v}}))} />
                                    <ColorInput label="Overlay Color (for image)" value={config.darkTheme?.overlayColor || ''} onChange={v => setConfig(p => ({...p, darkTheme: {...p.darkTheme, overlayColor: v}}))} />
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Background Image</Label>
                                <Input type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
                                {config.backgroundImage && <Image src={config.backgroundImage} alt="preview" width={128} height={80} className="w-32 h-20 object-cover rounded-md mt-2 border" />}
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
                                    <Input value={config.customPathLight || ''} onChange={(e) => setConfig(p => ({...p, customPathLight: e.target.value.replace(/[^a-z0-9-]/g, '')}))} placeholder="e.g., my-page-light" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Custom Path (Dark Mode)</Label>
                                    <Input value={config.customPathDark || ''} onChange={(e) => setConfig(p => ({...p, customPathDark: e.target.value.replace(/[^a-z0-9-]/g, '')}))} placeholder="e.g., my-page-dark" />
                                </div>
                             </div>
                             <p className="text-xs text-muted-foreground">Assign an optional unique path to access this page with a specific theme. Use only lowercase letters, numbers, and hyphens.</p>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>
            </Accordion>
            
            <CardFooter className="flex justify-end px-0">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Page
                </Button>
            </CardFooter>
        </div>
    );
}
