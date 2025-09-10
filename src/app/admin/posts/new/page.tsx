
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy } from 'lucide-react';
import { uploadImageAction, saveArticleAction } from '@/app/actions';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Article } from '@/types';


function ImageUploader({ label, onImageUpload, isUploading }: { label: string; onImageUpload: (url: string) => void; isUploading: boolean; }) {
    const { toast } = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file.' });
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const imageDataUri = reader.result as string;
            const result = await uploadImageAction({ imageDataUri });
            if (result.success) {
                onImageUpload(result.data.imageUrl);
                toast({ title: 'Success', description: `${label} uploaded successfully.` });
            } else {
                toast({ variant: 'destructive', title: 'Upload Failed', description: result.error });
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to read file.' });
        };
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="flex-1" />
                {isUploading && <Loader2 className="animate-spin" />}
            </div>
        </div>
    );
}


export default function NewPostPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    
    // Layout States
    const [contentAlignment, setContentAlignment] = useState<Article['contentAlignment']>('left');
    const [paragraphSpacing, setParagraphSpacing] = useState<Article['paragraphSpacing']>('medium');
    const [inContentImagesAlignment, setInContentImagesAlignment] = useState<Article['inContentImagesAlignment']>('center');

    const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [isUploadingInContent, setIsUploadingInContent] = useState(false);
    const [inContentImageUrl, setInContentImageUrl] = useState<string | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
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

        // Process content to wrap paragraphs
        const formattedContent = content.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');


        const articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
            title,
            content: formattedContent,
            status,
            authorId: user.uid,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            imageUrl: featuredImageUrl,
            backgroundImageUrl,
            commentsEnabled: true,
            generationSource: 'manual' as const,
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
                    <CardDescription>Manually craft your article with full control over every detail.</CardDescription>
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
                        <Label htmlFor="content" className="text-lg">Content</Label>
                        <Textarea 
                            id="content"
                            placeholder="Start writing your masterpiece here... Use paragraph breaks for spacing. You can insert image HTML from the uploader below."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="text-base leading-relaxed"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h3 className="text-lg font-medium">Media</h3>
                            <div className="space-y-2 rounded-lg border p-4">
                                <ImageUploader 
                                    label="Featured Image" 
                                    onImageUpload={setFeaturedImageUrl} 
                                    isUploading={isUploadingFeatured}
                                />
                                {featuredImageUrl && (
                                    <div className="mt-4 relative aspect-video w-full">
                                        <Image src={featuredImageUrl} alt="Featured image preview" fill className="rounded-md object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 rounded-lg border p-4">
                                <ImageUploader 
                                    label="Background Image" 
                                    onImageUpload={setBackgroundImageUrl} 
                                    isUploading={isUploadingBackground}
                                />
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
                            <div className="space-y-4 rounded-lg border p-4">
                                <h4 className="font-semibold">In-Content Image Uploader</h4>
                                <p className="text-sm text-muted-foreground">
                                    Upload an image, copy the HTML, and paste it into the content editor on a new line.
                                </p>
                                <ImageUploader 
                                    label="Upload Image"
                                    onImageUpload={setInContentImageUrl}
                                    isUploading={isUploadingInContent}
                                />
                                {inContentImageUrl && (
                                    <div className="space-y-2">
                                        <Label>Image HTML</Label>
                                        <div className="flex items-center gap-2">
                                            <Input readOnly value={`<img src="${inContentImageUrl}" alt="in-content image" class="in-content-image" />`} className="bg-muted text-xs"/>
                                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(`<img src="${inContentImageUrl}" alt="in-content image" class="in-content-image" />`)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
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

    