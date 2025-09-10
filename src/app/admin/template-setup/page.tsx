

"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2, GripVertical, Plus, Palette, Code, Newspaper, Link as LinkIcon, Star, LayoutGrid } from 'lucide-react';
import { getTemplateConfigAction, saveTemplateConfigAction, setActiveTemplateAction, uploadImageAction } from '@/app/actions';
import type { TemplateConfig, HeaderConfig, MenuItem, AdConfig, HeroSectionConfig, HeroColors, LatestPostsGridConfig, LatestPostsGridColors } from '@/types';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PostSelector } from '@/components/post-selector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const availableSections = [
    { name: 'Hero Section', id: '#hero' },
    { name: 'Features Section', id: '#features' },
    { name: 'Pricing Section', id: '#pricing' },
    { name: 'FAQ Section', id: '#faq' },
];


function TemplateSection({ templateId, title, description }: { templateId: string, title: string, description: string }) {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<TemplateConfig>>({
        themeMode: 'light',
        header: {},
        ads: {},
        hero: { enabled: false, sidePostIds: [], lightModeColors: {}, darkModeColors: {}, badgeText: 'FEATURED', randomImageUrls: [], randomAuthorNames: [] },
        latestPostsGrid: { enabled: false, mode: 'automatic', postLimit: 6, lightModeColors: {}, darkModeColors: {}},
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPostSelectorOpen, setIsPostSelectorOpen] = useState(false);
    const [postSelectorConfig, setPostSelectorConfig] = useState({ limit: 1, target: '' });


    useEffect(() => {
        async function loadConfig() {
            setIsLoading(true);
            const result = await getTemplateConfigAction(templateId);
            if (result.success && result.data) {
                const loadedConfig = result.data;
                if (loadedConfig.header && typeof loadedConfig.header.menuItems === 'string') {
                    loadedConfig.header.menuItems = [];
                }
                if (!loadedConfig.ads) loadedConfig.ads = {};
                if (!loadedConfig.hero) loadedConfig.hero = { enabled: false, sidePostIds: [], lightModeColors: {}, darkModeColors: {}, badgeText: 'FEATURED', randomImageUrls: [], randomAuthorNames: [] };
                if (!loadedConfig.latestPostsGrid) loadedConfig.latestPostsGrid = { enabled: false, mode: 'automatic', postLimit: 6, lightModeColors: {}, darkModeColors: {}};

                setConfig(loadedConfig);
            } else if (!result.success) {
                 toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
            setIsLoading(false);
        }
        loadConfig();
    }, [templateId, toast]);

    const handleInputChange = (key: keyof TemplateConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };
    
    const handleHeaderChange = (key: keyof HeaderConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            header: { ...(prev.header || {}), [key]: value }
        }));
    };
    
    const handleAdChange = (key: keyof AdConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            ads: { ...(prev.ads || {}), [key]: value }
        }));
    };
    
    const handleHeroChange = (key: keyof HeroSectionConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            hero: { ...(prev.hero || { enabled: false }), [key]: value }
        }));
    };

    const handleHeroColorChange = (mode: 'light' | 'dark', key: keyof HeroColors, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({
            ...prev,
            hero: {
                ...(prev.hero || {}),
                [colorKey]: { ...prev.hero?.[colorKey], [key]: value }
            }
        }));
    };

    const handleLatestGridChange = (key: keyof LatestPostsGridConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            latestPostsGrid: { ...(prev.latestPostsGrid || { enabled: false }), [key]: value }
        }));
    };

    const handleLatestGridColorChange = (mode: 'light' | 'dark', key: keyof LatestPostsGridColors, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({
            ...prev,
            latestPostsGrid: {
                ...(prev.latestPostsGrid || {}),
                [colorKey]: { ...prev.latestPostsGrid?.[colorKey], [key]: value }
            }
        }));
    };


    const handleHeaderColorChange = (mode: 'light' | 'dark', key: string, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({
            ...prev,
            header: {
                ...(prev.header || {}),
                [colorKey]: { ...prev.header?.[colorKey], [key]: value }
            }
        }));
    };

    const handleMenuItemChange = (id: string, field: keyof MenuItem, value: string) => {
        const updatedMenuItems = config.header?.menuItems?.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        handleHeaderChange('menuItems', updatedMenuItems);
    };

    const addMenuItem = () => {
        const newItem: MenuItem = { id: `menu-${Date.now()}`, name: 'New Item', type: 'path', value: '/' };
        const updatedMenuItems = [...(config.header?.menuItems || []), newItem];
        handleHeaderChange('menuItems', updatedMenuItems);
    };
    
    const removeMenuItem = (id: string) => {
        const updatedMenuItems = config.header?.menuItems?.filter(item => item.id !== id);
        handleHeaderChange('menuItems', updatedMenuItems);
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
                window.dispatchEvent(new CustomEvent('template-activated', { detail: { templateId } }));
                toast({ title: 'Success', description: `${title} is now the active main page template.` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        }
        setIsSaving(false);
    }
    
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
    
    const openPostSelector = (limit: number, target: string) => {
        setPostSelectorConfig({ limit, target });
        setIsPostSelectorOpen(true);
    };

    const handlePostSelection = (postIds: string[]) => {
        if (postSelectorConfig.target === 'hero-featured') {
            handleHeroChange('featuredPostId', postIds[0] || '');
        } else if (postSelectorConfig.target === 'hero-side') {
            handleHeroChange('sidePostIds', postIds);
        } else if (postSelectorConfig.target === 'latest-grid-manual') {
            handleLatestGridChange('manualPostIds', postIds);
        } else if (postSelectorConfig.target === 'latest-grid-featured') {
            handleLatestGridChange('featuredPostId', postIds[0] || '');
        }
    };


    if (isLoading) {
        return <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
    }
    
    const ColorInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (value: string) => void, placeholder?: string }) => (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: value || 'transparent' }} />
                <Input
                    placeholder={placeholder || "#FFFFFF or url(...)"}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );

    const HeaderColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;
        
        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.header?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Header Colors</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Header Background" value={colors.backgroundColor || ''} onChange={(v) => handleHeaderColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Header Text" value={colors.textColor || ''} onChange={(v) => handleHeaderColorChange(mode, 'textColor', v)} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <ColorInput label="Subscribe Button BG" value={colors.subscribeButtonBgColor || ''} onChange={(v) => handleHeaderColorChange(mode, 'subscribeButtonBgColor', v)} />
                    <ColorInput label="Subscribe Button Text" value={colors.subscribeButtonTextColor || ''} onChange={(v) => handleHeaderColorChange(mode, 'subscribeButtonTextColor', v)} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <ColorInput label="Sign In Button BG" value={colors.loginButtonBgColor || ''} onChange={(v) => handleHeaderColorChange(mode, 'loginButtonBgColor', v)} />
                    <ColorInput label="Sign In Button Text" value={colors.loginButtonTextColor || ''} onChange={(v) => handleHeaderColorChange(mode, 'loginButtonTextColor', v)} />
                </div>
            </div>
        )
    };

    const HeroColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;
        
        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.hero?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Hero Colors</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Background" value={colors.backgroundColor || ''} onChange={(v) => handleHeroColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Overlay" value={colors.overlayColor || ''} onChange={(v) => handleHeroColorChange(mode, 'overlayColor', v)} placeholder="rgba(0, 0, 0, 0.5)"/>
                    <ColorInput label="Title Text" value={colors.titleColor || ''} onChange={(v) => handleHeroColorChange(mode, 'titleColor', v)} />
                    <ColorInput label="Meta Text" value={colors.metaColor || ''} onChange={(v) => handleHeroColorChange(mode, 'metaColor', v)} />
                     <ColorInput label="Icon" value={colors.iconColor || ''} onChange={(v) => handleHeroColorChange(mode, 'iconColor', v)} />
                     <ColorInput label="Text Box Overlay" value={colors.textBoxOverlayColor || ''} onChange={(v) => handleHeroColorChange(mode, 'textBoxOverlayColor', v)} placeholder="rgba(0, 0, 0, 0.3)"/>
                </div>
            </div>
        )
    };

     const LatestGridColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;
        
        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.latestPostsGrid?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Latest Posts Colors</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Background" value={colors.backgroundColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Overlay" value={colors.overlayColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'overlayColor', v)} placeholder="rgba(0, 0, 0, 0.5)"/>
                    <ColorInput label="Section Title Text" value={colors.headerTextColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'headerTextColor', v)} />
                    <ColorInput label="Section Description Text" value={colors.descriptionTextColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'descriptionTextColor', v)} />
                    <ColorInput label="Post Title Text" value={colors.postTitleColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'postTitleColor', v)} />
                    <ColorInput label="Post Description Text" value={colors.postDescriptionColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'postDescriptionColor', v)} />
                    <ColorInput label="Post Meta Text" value={colors.postMetaColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'postMetaColor', v)} />
                    <ColorInput label="Featured Badge Text" value={colors.featuredBadgeTextColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'featuredBadgeTextColor', v)} />
                    <ColorInput label="Featured Badge BG" value={colors.featuredBadgeBackgroundColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'featuredBadgeBackgroundColor', v)} />
                    <ColorInput label="Featured Badge Icon" value={colors.featuredBadgeIconColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'featuredBadgeIconColor', v)} />
                    <ColorInput label="Post Text Box Overlay" value={colors.postTextBoxOverlayColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'postTextBoxOverlayColor', v)} placeholder="rgba(0, 0, 0, 0.3)"/>
                    <ColorInput label="Featured Post Text Box Overlay" value={colors.featuredPostTextBoxOverlayColor || ''} onChange={(v) => handleLatestGridColorChange(mode, 'featuredPostTextBoxOverlayColor', v)} placeholder="rgba(0, 0, 0, 0.3)"/>
                </div>
            </div>
        )
    };
    
    const BulkImageUploader = ({ onUploadComplete }: { onUploadComplete: (urls: string[]) => void }) => {
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
                description: `${uploadedUrls.length} out of ${files.length} images were uploaded and added to the list.`,
            });

            setIsUploading(false);
        };

        return (
            <div className="space-y-2">
                <Label className="font-medium text-sm">Bulk Upload for Random Side Post Images</Label>
                 <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="flex-1"
                />
                {isUploading && (
                    <div className="space-y-1">
                        <progress value={uploadProgress} max="100" className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-primary transition-all duration-500"></progress>
                        <p className="text-xs text-muted-foreground text-center">Uploading {Math.round(uploadProgress / 100 * totalFiles)} of {totalFiles} images...</p>
                    </div>
                )}
                 <p className="text-xs text-muted-foreground">
                    Upload images to be used randomly for side posts that don't have a featured image.
                </p>
            </div>
        );
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
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor={`custom-path-light-${templateId}`}>Custom URL Path (Light Mode)</Label>
                        <div className="flex items-center">
                            <span className="p-2 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">/</span>
                            <Input
                                id={`custom-path-light-${templateId}`}
                                placeholder="e.g., tech-light"
                                value={config.customPathLight || ''}
                                onChange={(e) => handleInputChange('customPathLight', e.target.value.replace(/[^a-z0-9-]/g, ''))}
                                className="rounded-l-none"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Assign a unique path to this template's light theme.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`custom-path-dark-${templateId}`}>Custom URL Path (Dark Mode)</Label>
                        <div className="flex items-center">
                            <span className="p-2 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">/</span>
                            <Input
                                id={`custom-path-dark-${templateId}`}
                                placeholder="e.g., tech-dark"
                                value={config.customPathDark || ''}
                                onChange={(e) => handleInputChange('customPathDark', e.target.value.replace(/[^a-z0-9-]/g, ''))}
                                className="rounded-l-none"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Assign a unique path to this template's dark theme.
                        </p>
                    </div>
                 </div>


                 <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">Theme Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="theme-mode">Theme for Main Page</Label>
                            <Select value={config.themeMode || 'light'} onValueChange={(value) => handleInputChange('themeMode', value as 'light' | 'dark')}>
                                <SelectTrigger id="theme-mode">
                                    <SelectValue placeholder="Select a theme mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light Mode</SelectItem>
                                    <SelectItem value="dark">Dark Mode</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select the theme for the main page (`/`) when this template is active.
                            </p>
                        </div>
                    </div>
                </div>


                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="ad-settings">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-primary" />
                                Ad Code Placement
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="enable-head-script" className="font-semibold">Enable Header Scripts</Label>
                                        <p className="text-sm text-muted-foreground">Inject scripts into the page's &lt;head&gt; tag.</p>
                                    </div>
                                    <Switch
                                        id="enable-head-script"
                                        checked={config.ads?.enableHeadScript}
                                        onCheckedChange={(checked) => handleAdChange('enableHeadScript', checked)}
                                    />
                                </div>
                                {config.ads?.enableHeadScript && (
                                    <Textarea
                                        placeholder="<script>...</script>"
                                        value={config.ads?.headScript}
                                        onChange={(e) => handleAdChange('headScript', e.target.value)}
                                        className="font-mono text-xs"
                                        rows={6}
                                    />
                                )}
                            </div>
                             <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="enable-top-header-ad" className="font-semibold">Enable Top Header Ad</Label>
                                        <p className="text-sm text-muted-foreground">Display an ad unit above the main header.</p>
                                    </div>
                                    <Switch
                                        id="enable-top-header-ad"
                                        checked={config.ads?.enableTopHeaderAd}
                                        onCheckedChange={(checked) => handleAdChange('enableTopHeaderAd', checked)}
                                    />
                                </div>
                                {config.ads?.enableTopHeaderAd && (
                                    <Textarea
                                        placeholder="Paste your ad code here..."
                                        value={config.ads?.topHeaderAdScript}
                                        onChange={(e) => handleAdChange('topHeaderAdScript', e.target.value)}
                                        className="font-mono text-xs"
                                        rows={6}
                                    />
                                )}
                            </div>
                             <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="enable-under-header-ad" className="font-semibold">Enable Under Header Ad</Label>
                                        <p className="text-sm text-muted-foreground">Display an ad unit below the main header.</p>
                                    </div>
                                    <Switch
                                        id="enable-under-header-ad"
                                        checked={config.ads?.enableUnderHeaderAd}
                                        onCheckedChange={(checked) => handleAdChange('enableUnderHeaderAd', checked)}
                                    />
                                </div>
                                {config.ads?.enableUnderHeaderAd && (
                                    <Textarea
                                        placeholder="Paste your ad code here..."
                                        value={config.ads?.underHeaderAdScript}
                                        onChange={(e) => handleAdChange('underHeaderAdScript', e.target.value)}
                                        className="font-mono text-xs"
                                        rows={6}
                                    />
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="hero-section">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <Newspaper className="h-5 w-5 text-primary" />
                                Hero Section
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="enable-hero-section" className="font-semibold">Enable Hero Section</Label>
                                    <p className="text-sm text-muted-foreground">Display a featured post section at the top of the page.</p>
                                </div>
                                <Switch
                                    id="enable-hero-section"
                                    checked={config.hero?.enabled}
                                    onCheckedChange={(checked) => handleHeroChange('enabled', checked)}
                                />
                            </div>
                            
                            {config.hero?.enabled && (
                                <>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Content Selection</h4>
                                        <Button variant="outline" onClick={() => openPostSelector(1, 'hero-featured')}>
                                            {config.hero.featuredPostId ? 'Change Featured Post' : 'Select Featured Post'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground">ID: {config.hero.featuredPostId || 'None'}</p>
                                        
                                        <Button variant="outline" onClick={() => openPostSelector(6, 'hero-side')}>
                                            {config.hero.sidePostIds?.length > 0 ? 'Change Side Posts' : 'Select Side Posts'} ({config.hero.sidePostIds?.length || 0}/6)
                                        </Button>
                                        <p className="text-xs text-muted-foreground">IDs: {config.hero.sidePostIds?.join(', ') || 'None'}</p>
                                    </div>
                                    
                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Badge Settings</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Badge Text</Label>
                                                <Input value={config.hero?.badgeText || ''} onChange={(e) => handleHeroChange('badgeText', e.target.value)} />
                                            </div>
                                            <ColorInput label="Badge Text Color" value={config.hero?.lightModeColors?.badgeTextColor || ''} onChange={(v) => handleHeroColorChange('light', 'badgeTextColor', v)} />
                                            <ColorInput label="Badge Background Color" value={config.hero?.lightModeColors?.badgeBackgroundColor || ''} onChange={(v) => handleHeroColorChange('light', 'badgeBackgroundColor', v)} />
                                        </div>
                                    </div>

                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Author Display</h4>
                                         <Label htmlFor="random-authors">Random Author Names</Label>
                                        <Textarea
                                            id="random-authors"
                                            placeholder="Enter one author name per line. e.g., Jane Doe"
                                            value={config.hero?.randomAuthorNames?.join('\n') || ''}
                                            onChange={(e) => handleHeroChange('randomAuthorNames', e.target.value.split('\n'))}
                                            rows={4}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            If provided, a random name from this list will be shown for each post in the hero section. If empty, the actual post author will be used.
                                        </p>
                                    </div>
                                    
                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Image Settings</h4>
                                        <BulkImageUploader onUploadComplete={(urls) => handleHeroChange('randomImageUrls', [...(config.hero?.randomImageUrls || []), ...urls])} />
                                         {config.hero?.randomImageUrls && config.hero.randomImageUrls.length > 0 && (
                                            <div className="space-y-2 pt-4">
                                                <Label>Uploaded Image URLs</Label>
                                                <Textarea value={config.hero.randomImageUrls.join('\n')} readOnly rows={5} />
                                                <Button variant="destructive" size="sm" onClick={() => handleHeroChange('randomImageUrls', [])}>Clear All</Button>
                                            </div>
                                         )}
                                    </div>

                                    <HeroColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <HeroColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="latest-posts-grid">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                Latest Posts Grid
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="enable-latest-grid" className="font-semibold">Enable Latest Posts Grid</Label>
                                    <p className="text-sm text-muted-foreground">Display a grid of recent posts under the hero section.</p>
                                </div>
                                <Switch
                                    id="enable-latest-grid"
                                    checked={config.latestPostsGrid?.enabled}
                                    onCheckedChange={(checked) => handleLatestGridChange('enabled', checked)}
                                />
                            </div>

                            {config.latestPostsGrid?.enabled && (
                                <>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Section Header</h4>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={config.latestPostsGrid.headerText || ''} onChange={(e) => handleLatestGridChange('headerText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input value={config.latestPostsGrid.descriptionText || ''} onChange={(e) => handleLatestGridChange('descriptionText', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Post Selection</h4>
                                        <RadioGroup value={config.latestPostsGrid.mode} onValueChange={(v) => handleLatestGridChange('mode', v as any)} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="automatic" id="lg-auto" /><Label htmlFor="lg-auto">Automatic</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="manual" id="lg-manual" /><Label htmlFor="lg-manual">Manual</Label></div>
                                        </RadioGroup>

                                        {config.latestPostsGrid.mode === 'automatic' ? (
                                            <div className="space-y-2">
                                                <Label>Number of Posts</Label>
                                                <Input type="number" value={config.latestPostsGrid.postLimit} onChange={(e) => handleLatestGridChange('postLimit', parseInt(e.target.value, 10))} />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Button variant="outline" onClick={() => openPostSelector(50, 'latest-grid-manual')}>
                                                    Select Posts ({config.latestPostsGrid.manualPostIds?.length || 0})
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Featured Post</h4>
                                         <p className="text-sm text-muted-foreground">Select one large featured post for the last row.</p>
                                        <Button variant="outline" onClick={() => openPostSelector(1, 'latest-grid-featured')}>
                                            {config.latestPostsGrid.featuredPostId ? 'Change Featured Post' : 'Select Featured Post'}
                                        </Button>
                                         <div className="space-y-2">
                                            <Label>Featured Badge Text</Label>
                                            <Input value={config.latestPostsGrid.featuredBadgeText || ''} onChange={(e) => handleLatestGridChange('featuredBadgeText', e.target.value)} />
                                        </div>
                                    </div>

                                    <LatestGridColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <LatestGridColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>


                    <AccordionItem value="header-settings">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-primary" />
                                Header Settings
                            </div>
                        </AccordionTrigger>
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
                            
                            <div className="space-y-4">
                                <h3 className="text-md font-medium flex items-center gap-2"><Palette className="h-4 w-4 text-primary" />Header Colors</h3>
                                 <div className="space-y-4">
                                    <HeaderColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <HeaderColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Menu Items</Label>
                                <div className="space-y-3 rounded-lg border p-4">
                                    {config.header?.menuItems?.map((item) => (
                                        <div key={item.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border">
                                            <GripVertical className="h-5 w-5 mt-2 text-muted-foreground" />
                                            <div className="flex-1 space-y-2">
                                                <Input 
                                                    placeholder="Menu Name"
                                                    value={item.name}
                                                    onChange={(e) => handleMenuItemChange(item.id, 'name', e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <Select value={item.type} onValueChange={(value) => handleMenuItemChange(item.id, 'type', value)}>
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="path">Path</SelectItem>
                                                            <SelectItem value="section">Section</SelectItem>
                                                            <SelectItem value="url">URL</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    
                                                    {item.type === 'section' ? (
                                                        <Select value={item.value} onValueChange={(value) => handleMenuItemChange(item.id, 'value', value)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a section" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableSections.map(sec => (
                                                                    <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input
                                                            placeholder={
                                                                item.type === 'path' ? '/about-us' :
                                                                item.type === 'url' ? 'https://example.com' : ''
                                                            }
                                                            value={item.value}
                                                            onChange={(e) => handleMenuItemChange(item.id, 'value', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeMenuItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addMenuItem} className="w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-md font-medium">Header Buttons</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="subscribe-text">Subscribe Button Text</Label>
                                        <Input 
                                            id="subscribe-text"
                                            placeholder="Subscribe" 
                                            value={config.header?.subscribeButtonText || ''}
                                            onChange={(e) => handleHeaderChange('subscribeButtonText', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subscribe-link">Subscribe Button Link</Label>
                                        <Input 
                                            id="subscribe-link"
                                            placeholder="/subscribe or https://..." 
                                            value={config.header?.subscribeLink || ''}
                                            onChange={(e) => handleHeaderChange('subscribeLink', e.target.value)}
                                        />
                                    </div>
                                    
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-text">Sign In Button Text</Label>
                                        <Input 
                                            id="login-text"
                                            placeholder="SIGN IN" 
                                            value={config.header?.loginButtonText || ''}
                                            onChange={(e) => handleHeaderChange('loginButtonText', e.target.value)}
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
             <PostSelector 
                open={isPostSelectorOpen}
                onOpenChange={setIsPostSelectorOpen}
                onSelect={handlePostSelection}
                currentSelection={
                    postSelectorConfig.target === 'hero-featured' 
                        ? (config.hero?.featuredPostId ? [config.hero.featuredPostId] : [])
                        : postSelectorConfig.target === 'hero-side'
                        ? (config.hero?.sidePostIds || [])
                        : postSelectorConfig.target === 'latest-grid-manual'
                        ? (config.latestPostsGrid?.manualPostIds || [])
                        : postSelectorConfig.target === 'latest-grid-featured'
                        ? (config.latestPostsGrid?.featuredPostId ? [config.latestPostsGrid.featuredPostId] : [])
                        : []
                }
                selectionLimit={postSelectorConfig.limit}
            />
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
        </div>
    );
}
