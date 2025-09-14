"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Palette, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { getPageConfigAction, savePageConfigAction, uploadImageAction, getAllCategoriesAction } from '@/app/actions';
import type { PageConfig, PageSection, BlogPageConfig } from '@/types';
import type { Category } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { PostSelector } from './post-selector';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


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

function MultiSelectCategories({ allCategories, selected, onSelectionChange }: { allCategories: Category[], selected: string[], onSelectionChange: (selected: string[]) => void }) {
    const [open, setOpen] = useState(false);

    const handleSelect = (categoryName: string) => {
        const newSelection = selected.includes(categoryName)
            ? selected.filter(name => name !== categoryName)
            : [...selected, categoryName];
        onSelectionChange(newSelection);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selected.length > 0 ? `${selected.length} selected` : "Select categories..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                            {allCategories.map((cat) => (
                                <CommandItem
                                    key={cat.id}
                                    onSelect={() => handleSelect(cat.name)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(cat.name) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {cat.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}


export function PageEditor({ pageId }: { pageId: string }) {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<PageConfig>>({});
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPostSelectorOpen, setIsPostSelectorOpen] = useState(false);
    
    const pageTitle = useMemo(() => {
        if (pageId === 'about') return 'About Us';
        if (pageId === 'contact') return 'Contact Us';
        if (pageId === 'privacy') return 'Privacy Policy';
        if (pageId === 'terms') return 'Terms & Conditions';
        if (pageId === 'login') return 'Login Page';
        if (pageId === 'signup') return 'Signup Page';
        if (pageId === 'blog') return 'Published Posts Page';
        return 'Page';
    }, [pageId]);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [pageResult, categoriesResult] = await Promise.all([
                getPageConfigAction(pageId),
                getAllCategoriesAction()
            ]);

            if (pageResult.success && pageResult.data) {
                 setConfig({
                    ...pageResult.data,
                    blogPageConfig: {
                        mode: 'all', // Default value
                        source: 'all', // Default value
                        postsPerPage: 9, // Default value
                        ...pageResult.data.blogPageConfig,
                    },
                });
            } else {
                setConfig({
                    id: pageId,
                    title: pageTitle,
                    content: '',
                    sections: [],
                    lightTheme: {},
                    darkTheme: {},
                    contactDetails: { email: '', whatsapp: '', telegram: '' },
                    enableOnSignup: false,
                    blogPageConfig: { mode: 'all', source: 'all', selectedPostIds: [], showAllCategories: true, selectedCategories: [], postsPerPage: 9 },
                });
            }

            if (categoriesResult.success) {
                setAllCategories(categoriesResult.data.categories);
            }

            setIsLoading(false);
        }
        loadData();
    }, [pageId, pageTitle]);

    const handleInputChange = (field: keyof PageConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleBlogConfigChange = (field: keyof BlogPageConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            blogPageConfig: { ...(prev.blogPageConfig || { mode: 'all', source: 'all', postsPerPage: 9 }), [field]: value }
        }));
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

    const handlePostSelection = (postIds: string[]) => {
       handleBlogConfigChange('selectedPostIds', postIds);
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
    
    const isAuthPage = pageId === 'login' || pageId === 'signup';

    return (
        <div className="flex-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editing: {pageTitle}</CardTitle>
                    <CardDescription>Manage the content and appearance of your {pageTitle} page.</CardDescription>
                </CardHeader>
                {!isAuthPage && (
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="page-title">Main Title</Label>
                            <Input id="page-title" value={config.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="main-content">Main Content / Description</Label>
                            <Textarea id="main-content" value={config.content || ''} onChange={(e) => handleInputChange('content', e.target.value)} rows={pageId === 'blog' ? 3 : 6} />
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
                        
                        {(pageId === 'about' || pageId === 'privacy' || pageId === 'terms') && (
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
                         {pageId === 'blog' && (
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="font-medium">Post Display Settings</h3>
                                <RadioGroup 
                                    value={config.blogPageConfig?.mode || 'all'} 
                                    onValueChange={(value) => handleBlogConfigChange('mode', value as any)}
                                    className="flex flex-wrap gap-4"
                                >
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="mode-all" /><Label htmlFor="mode-all">Automatic</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="selected" id="mode-selected" /><Label htmlFor="mode-selected">Manual Selection</Label></div>
                                </RadioGroup>

                                {config.blogPageConfig?.mode === 'selected' && (
                                    <div className="pt-4 border-t mt-4">
                                        <Button variant="outline" onClick={() => setIsPostSelectorOpen(true)}>
                                            Select Posts ({config.blogPageConfig?.selectedPostIds?.length || 0} selected)
                                        </Button>
                                        <PostSelector
                                            open={isPostSelectorOpen}
                                            onOpenChange={setIsPostSelectorOpen}
                                            onSelect={handlePostSelection}
                                            currentSelection={config.blogPageConfig?.selectedPostIds || []}
                                            selectionLimit={100}
                                        />
                                    </div>
                                )}
                                 {config.blogPageConfig?.mode === 'all' && (
                                    <div className="pt-4 border-t mt-4 space-y-4">
                                        <div className='space-y-2'>
                                            <Label>Post Source Filter</Label>
                                            <Select value={config.blogPageConfig?.source || 'all'} onValueChange={(value) => handleBlogConfigChange('source', value as any)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Posts</SelectItem>
                                                    <SelectItem value="cron">AutoBlogger: Cron</SelectItem>
                                                    <SelectItem value="manual-gen">AutoBlogger: Manual</SelectItem>
                                                    <SelectItem value="editor">Manual: Editor Posts</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">Filter which posts appear on the page by their creation source.</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="show-all-categories"
                                                checked={config.blogPageConfig?.showAllCategories}
                                                onCheckedChange={(checked) => handleBlogConfigChange('showAllCategories', checked)}
                                            />
                                            <Label htmlFor="show-all-categories">Show client-side filters for all available categories</Label>
                                        </div>
                                         {!config.blogPageConfig?.showAllCategories && (
                                            <div>
                                                <Label>Select categories to display server-side</Label>
                                                <MultiSelectCategories
                                                    allCategories={allCategories}
                                                    selected={config.blogPageConfig?.selectedCategories || []}
                                                    onSelectionChange={(selection) => handleBlogConfigChange('selectedCategories', selection)}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">The page will only show posts from these categories. If none are selected, all posts will be shown.</p>
                                            </div>
                                         )}
                                        <div className="space-y-2">
                                            <Label>Posts Per Page</Label>
                                            <Input type="number" value={config.blogPageConfig?.postsPerPage || 9} onChange={(e) => handleBlogConfigChange('postsPerPage', parseInt(e.target.value, 10))} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {pageId === 'terms' && (
                            <div className="space-y-4 rounded-lg border p-4">
                               <div className="flex items-center justify-between">
                                   <div>
                                     <Label htmlFor="enable-on-signup" className="font-semibold">Enable on Signup Page</Label>
                                     <p className="text-sm text-muted-foreground">
                                        Require users to agree to the Terms &amp; Conditions during signup.
                                     </p>
                                   </div>
                                   <Switch id="enable-on-signup" checked={config.enableOnSignup} onCheckedChange={(checked) => handleInputChange('enableOnSignup', checked)} />
                                </div>
                            </div>
                        )}

                    </CardContent>
                )}
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
                                    <ColorInput label="Background/Card Color" value={config.lightTheme?.backgroundColor || ''} onChange={v => handleThemeChange('lightTheme', 'backgroundColor', v)} />
                                    <ColorInput label="Title Color" value={config.lightTheme?.titleColor || ''} onChange={v => handleThemeChange('lightTheme', 'titleColor', v)} />
                                    <ColorInput label="Text/Description Color" value={config.lightTheme?.textColor || ''} onChange={v => handleThemeChange('lightTheme', 'textColor', v)} />
                                    <ColorInput label="Overlay Color (for image)" value={config.lightTheme?.overlayColor || ''} onChange={v => handleThemeChange('lightTheme', 'overlayColor', v)} />
                                </div>
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-medium">Dark Theme</h4>
                                    <ColorInput label="Background/Card Color" value={config.darkTheme?.backgroundColor || ''} onChange={v => handleThemeChange('darkTheme', 'backgroundColor', v)} />
                                    <ColorInput label="Title Color" value={config.darkTheme?.titleColor || ''} onChange={v => handleThemeChange('darkTheme', 'titleColor', v)} />
                                    <ColorInput label="Text/Description Color" value={config.darkTheme?.textColor || ''} onChange={v => handleThemeChange('darkTheme', 'textColor', v)} />
                                    <ColorInput label="Overlay Color (for image)" value={config.darkTheme?.overlayColor || ''} onChange={v => handleThemeChange('darkTheme', 'overlayColor', v)} />
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Background Image</Label>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                                {config.backgroundImage && <Image src={config.backgroundImage} alt="preview" width={128} height={80} className="w-32 h-20 object-cover rounded-md mt-2 border" />}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>

                 {!isAuthPage && (
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
                                        <Input value={config.customPathLight || ''} onChange={(e) => handleInputChange('customPathLight', e.target.value.replace(/[^a-z0-9-]/g, ''))} placeholder="e.g., terms-light" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Custom Path (Dark Mode)</Label>
                                        <Input value={config.customPathDark || ''} onChange={(e) => handleInputChange('customPathDark', e.target.value.replace(/[^a-z0-9-]/g, ''))} placeholder="e.g., terms-dark" />
                                    </div>
                                 </div>
                                 <p className="text-xs text-muted-foreground">Assign a unique path to access this page. Use only lowercase letters, numbers, and hyphens.</p>
                            </AccordionContent>
                        </AccordionItem>
                     </Card>
                 )}
            </Accordion>
            
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Changes
                </Button>
            </div>
        </div>
    );
}
