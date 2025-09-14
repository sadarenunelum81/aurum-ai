
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Pilcrow } from 'lucide-react';
import { uploadImageAction, saveArticleAction, getAllCategoriesAction, getAutoBloggerConfigAction } from '@/app/actions';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Article } from '@/types';
import type { Category } from '@/lib/categories';
import Link from 'next/link';

type ContentBlock = {
    id: string;
    type: 'paragraph' | 'image';
    content: string; // URL for image, text for paragraph
};

// This function converts the array of blocks into a final HTML string for saving.
function blocksToHtml(blocks: ContentBlock[]): string {
    return blocks.map(block => {
        if (block.type === 'paragraph') {
            return `<p>${block.content}</p>`;
        }
        if (block.type === 'image') {
             // The class 'in-content-image' is a generic marker. 
            // The alignment classes will be applied by the renderer (PostList) based on the article's settings.
            return `<div class="clearfix my-4"><img src="${block.content}" alt="in-content image" class="in-content-image rounded-lg shadow-md" /></div>`;
        }
        return '';
    }).join('\n');
}

export default function NewPostPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([{ id: `p${Date.now()}`, type: 'paragraph', content: '' }]);
    
    const [tags, setTags] = useState('');
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [category, setCategory] = useState('');
    
    const [contentAlignment, setContentAlignment] = useState<Article['contentAlignment']>('left');
    const [paragraphSpacing, setParagraphSpacing] = useState<Article['paragraphSpacing']>('medium');
    const [inContentImagesAlignment, setInContentImagesAlignment] = useState<Article['inContentImagesAlignment']>('center');

    const [postTitleColor, setPostTitleColor] = useState('');
    const [postContentColor, setPostContentColor] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const catResult = await getAllCategoriesAction();
            if (catResult.success) {
                setCategories(catResult.data.categories);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load categories.' });
            }

            const configResult = await getAutoBloggerConfigAction();
            if (configResult.success && configResult.data) {
                setPostTitleColor(configResult.data.postTitleColor || '');
                setPostContentColor(configResult.data.postContentColor || '');
            }
        }
        fetchData();
    }, [toast]);
    
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
    };

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


    const handleSave = async (status: 'draft' | 'published') => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save.' });
            return;
        }
        if (!title) {
            toast({ variant: 'destructive', title: 'Missing Title', description: 'Please provide a title for your post.' });
            return;
        }
        
        setIsSaving(true);
        const finalHtml = blocksToHtml(contentBlocks);

        const articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
            title,
            content: finalHtml,
            status,
            authorId: user.uid,
            category,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            imageUrl: featuredImageUrl,
            backgroundImageUrl,
            commentsEnabled: true,
            generationSource: 'editor',
            contentAlignment,
            paragraphSpacing,
            inContentImagesAlignment,
        };

        const result = await saveArticleAction(articleData);

        if (result.success) {
            toast({ title: 'Success', description: `Article saved as ${status}.` });
            router.push('/admin/posts');
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.error });
        }

        setIsSaving(false);
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Post</CardTitle>
                    <CardDescription>Craft your article using the block editor below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-lg">Title</Label>
                        <Input 
                            id="title" 
                            placeholder="Your amazing blog post title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-headline h-auto p-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg">Content</Label>
                        <div className="space-y-4 rounded-md border p-4">
                            {contentBlocks.map((block, index) => (
                                <div key={block.id} className="group relative pt-8">
                                    {/* Block Controls */}
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

                                    {/* Block Content */}
                                    {block.type === 'paragraph' ? (
                                        <Textarea
                                            value={block.content}
                                            onChange={(e) => handleBlockChange(block.id, e.target.value)}
                                            placeholder="Start writing your paragraph here..."
                                            className="text-base leading-relaxed font-mono min-h-[120px]"
                                        />
                                    ) : (
                                        <div className="relative aspect-video w-full max-w-xl mx-auto">
                                            <Image src={block.content} alt="In-content image" fill className="rounded-md object-contain" />
                                        </div>
                                    )}

                                    {/* Add Block Controls */}
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
                                        <Plus className="mr-2 h-4 w-4"/> Add First Paragraph
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h3 className="text-lg font-medium">Media</h3>
                            <div className="space-y-2 rounded-lg border p-4">
                                <Label>Featured Image</Label>
                                <Input type="file" accept="image/*" onChange={async (e) => {
                                   if (!e.target.files) return;
                                   const file = e.target.files[0];
                                   const reader = new FileReader();
                                   reader.readAsDataURL(file);
                                   reader.onload = async () => {
                                        const imageDataUri = reader.result as string;
                                        const result = await uploadImageAction({ imageDataUri });
                                        if (result.success) setFeaturedImageUrl(result.data.imageUrl);
                                   }
                               }} />
                                {featuredImageUrl && (
                                    <div className="mt-4 relative aspect-video w-full">
                                        <Image src={featuredImageUrl} alt="Featured image preview" fill className="rounded-md object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 rounded-lg border p-4">
                               <Label>Background Image</Label>
                               <Input type="file" accept="image/*" onChange={async (e) => {
                                   if (!e.target.files) return;
                                   const file = e.target.files[0];
                                   const reader = new FileReader();
                                   reader.readAsDataURL(file);
                                   reader.onload = async () => {
                                        const imageDataUri = reader.result as string;
                                        const result = await uploadImageAction({ imageDataUri });
                                        if (result.success) setBackgroundImageUrl(result.data.imageUrl);
                                   }
                               }} />
                                {backgroundImageUrl && (
                                     <div className="mt-4 relative aspect-video w-full">
                                        <Image src={backgroundImageUrl} alt="Background image preview" fill className="rounded-md object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h3 className="text-lg font-medium">Details & Layout</h3>
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select onValueChange={setCategory} value={category}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input 
                                        id="tags"
                                        placeholder="e.g., tech, ai, writing"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paragraph-spacing">Paragraph Spacing</Label>
                                    <Select value={paragraphSpacing} onValueChange={(value) => setParagraphSpacing(value as any)}>
                                        <SelectTrigger id="paragraph-spacing">
                                            <SelectValue placeholder="Select spacing" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">Small</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="large">Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content-alignment">Content Alignment</Label>
                                    <Select value={contentAlignment} onValueChange={(value) => setContentAlignment(value as any)}>
                                        <SelectTrigger id="content-alignment">
                                            <SelectValue placeholder="Select alignment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="full">Full Width</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="in-content-alignment">In-Content Image Alignment</Label>
                                     <Select value={inContentImagesAlignment} onValueChange={(value) => setInContentImagesAlignment(value as any)}>
                                        <SelectTrigger id="in-content-alignment">
                                            <SelectValue placeholder="Select alignment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="center">Center (Full Width)</SelectItem>
                                            <SelectItem value="all-left">All Images Left</SelectItem>
                                            <SelectItem value="all-right">All Images Right</SelectItem>
                                            <SelectItem value="alternate-left">Alternate (start Left)</SelectItem>
                                            <SelectItem value="alternate-right">Alternate (start Right)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Applies to images inserted via HTML.</p>
                                </div>
                            </div>
                              <div className="space-y-3 rounded-lg border p-4">
                                <h4 className="font-semibold">Color Settings</h4>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-sm border" style={{ backgroundColor: postTitleColor.startsWith('#') ? postTitleColor : 'transparent' }} />
                                        <span className="text-muted-foreground">Title Color</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-sm border" style={{ backgroundColor: postContentColor.startsWith('#') ? postContentColor : 'transparent' }} />
                                        <span className="text-muted-foreground">Content Color</span>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href="/admin/general-settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Change Colors in General Settings
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save Draft'}
                    </Button>
                    <Button onClick={() => handleSave('published')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Publish Post'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
