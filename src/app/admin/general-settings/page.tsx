

"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveAutoBloggerConfigAction, getAutoBloggerConfigAction, uploadImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Loader2, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AutoBloggerConfig } from '@/types';
import { languages } from '@/lib/languages';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

function BulkImageUploader({ onUploadComplete, listTitle }: { onUploadComplete: (urls: string[]) => void, listTitle: string }) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setTotalFiles(files.length);
        setUploadProgress(0);

        const uploadedUrls: string[] = [];
        let completedUploads = 0;

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) {
                toast({ variant: 'destructive', title: 'Invalid File', description: `Skipping non-image file: ${file.name}` });
                completedUploads++;
                setUploadProgress((completedUploads / files.length) * 100);
                continue;
            }

            try {
                const reader = new FileReader();
                const fileReadPromise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(file);
                const imageDataUri = await fileReadPromise;

                const result = await uploadImageAction({ imageDataUri });
                if (result.success) {
                    uploadedUrls.push(result.data.imageUrl);
                } else {
                    throw new Error(result.error);
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: `Upload Failed for ${file.name}`, description: error.message });
            } finally {
                completedUploads++;
                setUploadProgress((completedUploads / files.length) * 100);
            }
        }
        
        onUploadComplete(uploadedUrls);

        toast({
            title: 'Bulk Upload Complete',
            description: `${uploadedUrls.length} out of ${files.length} images were uploaded and added to the ${listTitle} list.`,
        });

        setIsUploading(false);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={`bulk-image-upload-${listTitle.replace(/\s/g, '-')}`} className="font-medium text-sm">Bulk Upload URLs</Label>
            <div className="flex items-center gap-2">
                <Input
                    id={`bulk-image-upload-${listTitle.replace(/\s/g, '-')}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="flex-1 text-xs"
                />
                <Button onClick={() => document.getElementById(`bulk-image-upload-${listTitle.replace(/\s/g, '-')}`)?.click()} disabled={isUploading} variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Files
                </Button>
            </div>
            {isUploading && (
                <div className="space-y-1">
                    <progress value={uploadProgress} max="100" className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-primary transition-all duration-500"></progress>
                    <p className="text-xs text-muted-foreground text-center">Uploading {Math.round(uploadProgress / 100 * totalFiles)} of {totalFiles} images...</p>
                </div>
            )}
             <p className="text-xs text-muted-foreground">
                Upload multiple images at once. The URLs will be added to the list above.
            </p>
        </div>
    );
}

export default function GeneralSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [titleColor, setTitleColor] = useState('');
    const [contentColor, setContentColor] = useState('');
    const [language, setLanguage] = useState('en');
    const [globalRandomBackgroundUrls, setGlobalRandomBackgroundUrls] = useState('');
    const [globalBackgroundOverlayColor, setGlobalBackgroundOverlayColor] = useState('');


    const [openLanguageSelector, setOpenLanguageSelector] = useState(false);


    useEffect(() => {
        async function loadConfig() {
            setIsLoading(true);
            const result = await getAutoBloggerConfigAction();
            if (result.success && result.data) {
                const config = result.data;
                setTitleColor(config.postTitleColor || '');
                setContentColor(config.postContentColor || '');
                setLanguage(config.language || 'en');
                setGlobalRandomBackgroundUrls(config.globalRandomBackgroundUrls?.join('\n') || '');
                setGlobalBackgroundOverlayColor(config.globalBackgroundOverlayColor || '');
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
            language: language,
            globalRandomBackgroundUrls: globalRandomBackgroundUrls.split('\n').filter(Boolean),
            globalBackgroundOverlayColor: globalBackgroundOverlayColor,
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
                    <CardDescription>Customize the look, feel, and language of your blog posts.</CardDescription>
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
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Global Post Backgrounds</h3>
                        <div className="space-y-6 rounded-lg border p-4">
                             <div className="space-y-2">
                                <Label htmlFor="overlay-color">Default Background Overlay Color</Label>
                                <Input 
                                    id="overlay-color"
                                    type="text"
                                    placeholder="e.g., #00000080 or rgba(0,0,0,0.5)" 
                                    value={globalBackgroundOverlayColor}
                                    onChange={(e) => setGlobalBackgroundOverlayColor(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Hex or RGBA color for the overlay on random backgrounds.</p>
                                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: globalBackgroundOverlayColor || 'transparent' }} />
                            </div>
                            <Separator />
                             <div>
                                <Label htmlFor="global-bg-list">Global Random Background URLs</Label>
                                <Textarea 
                                    id="global-bg-list"
                                    placeholder="Paste one image URL per line."
                                    value={globalRandomBackgroundUrls}
                                    onChange={(e) => setGlobalRandomBackgroundUrls(e.target.value)}
                                    rows={5}
                                />
                                <p className="text-xs text-muted-foreground pt-1">
                                    These images are used randomly for posts that don't have a specific background image.
                                </p>
                            </div>
                            <Separator />
                            <BulkImageUploader 
                                listTitle="Global Background"
                                onUploadComplete={(urls) => {
                                    const currentList = globalRandomBackgroundUrls.split('\n').filter(Boolean);
                                    const newList = [...currentList, ...urls];
                                    setGlobalRandomBackgroundUrls(newList.join('\n'));
                                }}
                            />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Language Settings</h3>
                        <div className="space-y-2">
                            <Label htmlFor="language-select">Content Language</Label>
                             <Popover open={openLanguageSelector} onOpenChange={setOpenLanguageSelector}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openLanguageSelector}
                                    className="w-full justify-between md:w-[300px]"
                                    >
                                    {language
                                        ? languages.find((lang) => lang.code === language)?.name
                                        : "Select a language..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full md:w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search language..." />
                                        <CommandEmpty>No language found.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {languages.map((lang) => (
                                                        <CommandItem
                                                        key={lang.code}
                                                        value={lang.code}
                                                        onSelect={(currentValue) => {
                                                            setLanguage(currentValue === language ? "" : currentValue);
                                                            setOpenLanguageSelector(false);
                                                        }}
                                                        >
                                                        <Check
                                                            className={cn(
                                                            "mr-2 h-4 w-4",
                                                            language === lang.code ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {lang.name}
                                                        </CommandItem>
                                                    ))}
                                                </div>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                             <p className="text-xs text-muted-foreground">
                                All AI-generated content will be created in this language.
                            </p>
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

    
