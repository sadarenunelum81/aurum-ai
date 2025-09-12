
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Pilcrow, Image as ImageIcon } from "lucide-react";
import type { PageConfig } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { savePageConfigAction, uploadImageAction } from '@/app/actions';
import Image from 'next/image';

type ContentBlock = {
    id: string;
    type: 'paragraph' | 'image';
    content: string; // URL for image, text for paragraph
};


export default function NewCustomPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [path, setPath] = useState('');
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

    const handleBlockChange = (id: string, newContent: string) => {
        setContentBlocks(blocks => blocks.map(block => block.id === id ? { ...block, content: newContent } : block));
    };

    const addBlock = (type: 'paragraph' | 'image', index: number, content: string = '') => {
        const newBlock = { id: `${type[0]}${Date.now()}`, type, content };
        const newBlocks = [...contentBlocks];
        newBlocks.splice(index + 1, 0, newBlock);
        setContentBlocks(newBlocks);
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
    }

    const removeBlock = (id: string) => {
        setContentBlocks(blocks => blocks.filter(block => block.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === contentBlocks.length - 1) return;

        const newBlocks = [...contentBlocks];
        const block = newBlocks[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        newBlocks[index] = newBlocks[swapIndex];
        newBlocks[swapIndex] = block;
        setContentBlocks(newBlocks);
    };
    
    const handleSave = async () => {
        if (!title || !path) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a title and a URL path.' });
            return;
        }

        setIsSaving(true);
        const pageId = path.toLowerCase().replace(/\s+/g, '-');
        
        const pageConfig: PageConfig = {
            id: pageId,
            title: title,
            customPathLight: path, // For now, light and dark paths are the same
            content: '',
            sections: contentBlocks.map(block => ({ 
                id: block.id, 
                title: block.type === 'paragraph' ? '' : block.content, // A bit of a hack for now
                content: block.type === 'paragraph' ? block.content : ''
            })),
            lightTheme: {},
            darkTheme: {}
        };
        
        const result = await savePageConfigAction(pageId, pageConfig);

        if (result.success) {
            toast({ title: 'Page Saved', description: 'Your new custom page has been created.' });
            router.push('/admin/custom-pages');
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.error });
        }
        setIsSaving(false);
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Build Your Custom Page</CardTitle>
                    <CardDescription>Use the controls below to add and configure content blocks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="page-title">Page Title</Label>
                           <Input id="page-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Our Services" />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="page-path">URL Path</Label>
                           <div className="flex items-center">
                               <span className="p-2 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">/</span>
                               <Input 
                                   id="page-path" 
                                   value={path} 
                                   onChange={(e) => setPath(e.target.value.replace(/[^a-z0-9-]/g, ''))} 
                                   placeholder="e.g., our-services" 
                                   className="rounded-l-none"
                                />
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-lg">Content Blocks</Label>
                        <div className="space-y-4 rounded-md border p-4 min-h-[200px]">
                             {contentBlocks.map((block, index) => (
                                <div key={block.id} className="group relative pt-8">
                                    <div className="absolute top-0 right-0 flex items-center bg-background rounded-md border p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(index, 'down')} disabled={index === contentBlocks.length - 1}>
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeBlock(block.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {block.type === 'paragraph' ? (
                                        <Textarea
                                            value={block.content}
                                            onChange={(e) => handleBlockChange(block.id, e.target.value)}
                                            placeholder="Start writing..."
                                            className="text-base min-h-[100px]"
                                        />
                                    ) : (
                                        <div className="relative aspect-video w-full max-w-md mx-auto">
                                            <Image src={block.content} alt="Custom page image" fill className="rounded-md object-contain border" />
                                        </div>
                                    )}
                                     <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-1 p-1 rounded-full border bg-background shadow-sm">
                                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => addBlock('paragraph', index)}>
                                                <Pilcrow className="mr-2 h-4 w-4"/> Add Paragraph
                                            </Button>
                                             <input
                                                type="file"
                                                id={`image-upload-${index}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], index)}
                                            />
                                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => document.getElementById(`image-upload-${index}`)?.click()}>
                                                <ImageIcon className="mr-2 h-4 w-4"/> Add Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {contentBlocks.length === 0 && (
                                <div className="text-center py-10">
                                    <Button size="sm" onClick={() => addBlock('paragraph', -1)}>
                                        <Plus className="mr-2 h-4 w-4"/> Add First Block
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Page
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

    