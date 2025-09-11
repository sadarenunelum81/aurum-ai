
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2, GripVertical, Plus, Palette, Code, Newspaper, Link as LinkIcon, Star, LayoutGrid, FolderKanban, Columns, AppWindow, Footprints, ChevronsRight } from 'lucide-react';
import { getTemplateConfigAction, saveTemplateConfigAction, setActiveTemplateAction, uploadImageAction } from '@/app/actions';
import type { TemplateConfig, HeaderConfig, MenuItem, AdConfig, HeroSectionConfig, HeroColors, LatestPostsGridConfig, LatestPostsGridColors, CategoriesSectionConfig, CategorySlot, CategoriesSectionColors, DualSystemSectionConfig, DualSystemPartConfig, DualSystemColors, RecentPostsSectionConfig, RecentPostsSectionColors, FooterConfig, FooterColors, FooterMenuColumn } from '@/types';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PostSelector } from '@/components/post-selector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';


const availableSections = [
    { name: 'Hero Section', id: '#hero' },
    { name: 'Features Section', id: '#features' },
    { name: 'Pricing Section', id: '#pricing' },
    { name: 'FAQ Section', id: '#faq' },
];


function TemplateSection({ template, title, description }: { template: TemplateConfig, title: string, description: string }) {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<TemplateConfig>>(template);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPostSelectorOpen, setIsPostSelectorOpen] = useState(false);
    const [postSelectorConfig, setPostSelectorConfig] = useState({ limit: 1, target: '', part: 0, categoryIndex: -1 });
    const templateId = template.id;

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
    
    const handleCategoriesSectionChange = (key: keyof CategoriesSectionConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            categoriesSection: { ...(prev.categoriesSection || { enabled: false }), [key]: value }
        }));
    };

    const handleCategoriesSectionColorChange = (mode: 'light' | 'dark', key: keyof CategoriesSectionColors, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({
            ...prev,
            categoriesSection: {
                ...(prev.categoriesSection || {}),
                [colorKey]: { ...prev.categoriesSection?.[colorKey], [key]: value }
            }
        }));
    };

    const handleCategorySlotChange = (index: number, key: keyof CategorySlot, value: any) => {
        const newSlots = [...(config.categoriesSection?.categorySlots || [])];
        newSlots[index] = { ...newSlots[index], [key]: value };
        handleCategoriesSectionChange('categorySlots', newSlots);
    };

    const handleDualSystemChange = (key: keyof DualSystemSectionConfig, value: any) => {
        setConfig(prev => ({ ...prev, dualSystemSection: { ...(prev.dualSystemSection || { enabled: false }), [key]: value } }));
    };

    const handleDualSystemPartChange = (part: 'part1' | 'part2', key: keyof DualSystemPartConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            dualSystemSection: {
                ...(prev.dualSystemSection || {}),
                [part]: { ...(prev.dualSystemSection?.[part] || {}), [key]: value }
            }
        }));
    };
    
    const handleDualSystemColorChange = (mode: 'light' | 'dark', key: keyof DualSystemColors, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({
            ...prev,
            dualSystemSection: {
                ...(prev.dualSystemSection || {}),
                [colorKey]: { ...prev.dualSystemSection?.[colorKey], [key]: value }
            }
        }));
    };
    
    const handleRecentPostsChange = (key: keyof RecentPostsSectionConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            recentPostsSection: { ...(prev.recentPostsSection || { enabled: false }), [key]: value }
        }));
    };
    
    const handleRecentPostsColorChange = (mode: 'light' | 'dark', key: keyof RecentPostsSectionColors, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({
            ...prev,
            recentPostsSection: {
                ...(prev.recentPostsSection || {}),
                [colorKey]: { ...prev.recentPostsSection?.[colorKey], [key]: value }
            }
        }));
    };

    const handleFooterChange = (key: keyof FooterConfig, value: any) => {
        setConfig(prev => ({ ...prev, footer: { ...(prev.footer || { enabled: false }), [key]: value } }));
    };

    const handleFooterColorChange = (mode: 'light' | 'dark', key: keyof FooterColors, value: string) => {
        const colorKey = mode === 'light' ? 'lightModeColors' : 'darkModeColors';
        setConfig(prev => ({ ...prev, footer: { ...(prev.footer || {}), [colorKey]: { ...prev.footer?.[colorKey], [key]: value } } }));
    };

    const handleFooterMenuChange = (columnIndex: number, key: 'title' | 'links', value: any) => {
        const newColumns = [...(config.footer?.menuColumns || [])];
        (newColumns[columnIndex] as any)[key] = value;
        handleFooterChange('menuColumns', newColumns);
    };

    const handleFooterMenuLinkChange = (columnIndex: number, linkIndex: number, key: 'name' | 'value', value: string) => {
        const newColumns = [...(config.footer?.menuColumns || [])];
        if (!newColumns[columnIndex].links) newColumns[columnIndex].links = [];
        newColumns[columnIndex].links[linkIndex] = { ...newColumns[columnIndex].links[linkIndex], [key]: value };
        handleFooterChange('menuColumns', newColumns);
    };

    const addFooterMenuColumn = () => {
        const newColumn: FooterMenuColumn = { id: `col-${Date.now()}`, title: 'New Column', links: [] };
        handleFooterChange('menuColumns', [...(config.footer?.menuColumns || []), newColumn]);
    };
    
    const removeFooterMenuColumn = (id: string) => {
        handleFooterChange('menuColumns', config.footer?.menuColumns?.filter(col => col.id !== id));
    };

    const addFooterMenuLink = (columnIndex: number) => {
        const newLink = { id: `link-${Date.now()}`, name: 'New Link', value: '#' };
        const newColumns = [...(config.footer?.menuColumns || [])];
        if (!newColumns[columnIndex].links) newColumns[columnIndex].links = [];
        newColumns[columnIndex].links.push(newLink);
        handleFooterChange('menuColumns', newColumns);
    };
    
    const removeFooterMenuLink = (columnIndex: number, linkId: string) => {
        const newColumns = [...(config.footer?.menuColumns || [])];
        if (newColumns[columnIndex].links) {
            newColumns[columnIndex].links = newColumns[columnIndex].links.filter(link => link.id !== linkId);
            handleFooterChange('menuColumns', newColumns);
        }
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
    
    const openPostSelector = (limit: number, target: string, part: number = 0, categoryIndex: number = -1) => {
        setPostSelectorConfig({ limit, target, part, categoryIndex });
        setIsPostSelectorOpen(true);
    };

    const handlePostSelection = (postIds: string[]) => {
        const { target, part } = postSelectorConfig;

        if (target === 'hero-featured') {
            handleHeroChange('featuredPostId', postIds[0] || '');
        } else if (target === 'hero-side') {
            handleHeroChange('sidePostIds', postIds);
        } else if (target === 'latest-grid-manual') {
            handleLatestGridChange('manualPostIds', postIds);
        } else if (target === 'latest-grid-featured') {
            handleLatestGridChange('featuredPostId', postIds[0] || '');
        } else if (target === 'categories-section' && postSelectorConfig.categoryIndex !== -1) {
            handleCategorySlotChange(postSelectorConfig.categoryIndex, 'postIds', postIds);
        } else if (target === 'recent-posts-section') {
            handleRecentPostsChange('postIds', postIds);
        } else if (target.startsWith('dual-system-')) {
            const partKey = part === 1 ? 'part1' : 'part2';
            if (target.endsWith('-featured')) {
                handleDualSystemPartChange(partKey, 'featuredPostId', postIds[0] || '');
            } else if (target.endsWith('-side')) {
                handleDualSystemPartChange(partKey, 'sidePostIds', postIds);
            } else if (target.endsWith('-bottom')) {
                handleDualSystemPartChange(partKey, 'bottomPostIds', postIds);
            }
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
                    <ColorInput label="Hero Button BG" value={colors.heroButtonBgColor || ''} onChange={(v) => handleHeroColorChange(mode, 'heroButtonBgColor', v)} />
                    <ColorInput label="Hero Button Text" value={colors.heroButtonTextColor || ''} onChange={(v) => handleHeroColorChange(mode, 'heroButtonTextColor', v)} />
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

    const CategoriesSectionColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;
        
        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.categoriesSection?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Colors</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Background" value={colors.backgroundColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Overlay" value={colors.overlayColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'overlayColor', v)} placeholder="rgba(0, 0, 0, 0.5)"/>
                    <ColorInput label="Section Header Text" value={colors.headerTextColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'headerTextColor', v)} />
                    <ColorInput label="Section Description Text" value={colors.descriptionTextColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'descriptionTextColor', v)} />
                    <ColorInput label="Post Title Text" value={colors.postTitleColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'postTitleColor', v)} />
                    <ColorInput label="Post Meta Text" value={colors.postMetaColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'postMetaColor', v)} />
                    <ColorInput label="Post Box Background" value={colors.postBoxColor || ''} onChange={(v) => handleCategoriesSectionColorChange(mode, 'postBoxColor', v)} />
                </div>
            </div>
        )
    };
    
    const DualSystemColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;

        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.dualSystemSection?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
            <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Dual System Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Background" value={colors.backgroundColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Overlay" value={colors.overlayColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'overlayColor', v)} placeholder="rgba(0, 0, 0, 0.5)" />
                    <ColorInput label="Header Text" value={colors.headerTextColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'headerTextColor', v)} />
                    <ColorInput label="Line Color" value={colors.lineColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'lineColor', v)} />
                    <ColorInput label="Post Title Text" value={colors.postTitleColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'postTitleColor', v)} />
                    <ColorInput label="Post Meta Text" value={colors.postMetaColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'postMetaColor', v)} />
                    <ColorInput label="Post Title Box Overlay" value={colors.postTitleOverlayColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'postTitleOverlayColor', v)} placeholder="rgba(0, 0, 0, 0.2)" />
                    <ColorInput label="Show More Text" value={colors.showMoreTextColor || ''} onChange={(v) => handleDualSystemColorChange(mode, 'showMoreTextColor', v)} />
                </div>
            </div>
        );
    };

    const RecentPostsColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;

        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.recentPostsSection?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
            <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Background" value={colors.backgroundColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Overlay" value={colors.overlayColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'overlayColor', v)} placeholder="rgba(0, 0, 0, 0.5)" />
                    <ColorInput label="Header Text" value={colors.headerTextColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'headerTextColor', v)} />
                    <ColorInput label="Description Text" value={colors.descriptionTextColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'descriptionTextColor', v)} />
                    <ColorInput label="Post Title Text" value={colors.postTitleColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'postTitleColor', v)} />
                    <ColorInput label="Post Title Box Overlay" value={colors.postTitleOverlayColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'postTitleOverlayColor', v)} placeholder="rgba(0, 0, 0, 0.3)" />
                    <ColorInput label="Show More Button BG" value={colors.showMoreButtonBgColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'showMoreButtonBgColor', v)} />
                    <ColorInput label="Show More Button Text" value={colors.showMoreButtonTextColor || ''} onChange={(v) => handleRecentPostsColorChange(mode, 'showMoreButtonTextColor', v)} />
                </div>
            </div>
        );
    };

    const FooterColorSettings = ({ mode, isVisible }: { mode: 'light' | 'dark', isVisible: boolean }) => {
        if (!isVisible) return null;

        const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
        const colors = config.footer?.[mode === 'light' ? 'lightModeColors' : 'darkModeColors'] || {};

        return (
            <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">{modeTitle} Mode Footer Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Background" value={colors.backgroundColor || ''} onChange={(v) => handleFooterColorChange(mode, 'backgroundColor', v)} />
                    <ColorInput label="Overlay" value={colors.overlayColor || ''} onChange={(v) => handleFooterColorChange(mode, 'overlayColor', v)} placeholder="rgba(0, 0, 0, 0.5)" />
                    <ColorInput label="Line Color" value={colors.lineColor || ''} onChange={(v) => handleFooterColorChange(mode, 'lineColor', v)} />
                    <ColorInput label="Main Text" value={colors.textColor || ''} onChange={(v) => handleFooterColorChange(mode, 'textColor', v)} />
                    <ColorInput label="Title Text" value={colors.titleColor || ''} onChange={(v) => handleFooterColorChange(mode, 'titleColor', v)} />
                    <ColorInput label="Link Text" value={colors.linkColor || ''} onChange={(v) => handleFooterColorChange(mode, 'linkColor', v)} />
                    <ColorInput label="Copyright Text" value={colors.copyrightTextColor || ''} onChange={(v) => handleFooterColorChange(mode, 'copyrightTextColor', v)} />
                    <ColorInput label="Subscribe Button BG" value={colors.subscribeButtonBgColor || ''} onChange={(v) => handleFooterColorChange(mode, 'subscribeButtonBgColor', v)} />
                    <ColorInput label="Subscribe Button Text" value={colors.subscribeButtonTextColor || ''} onChange={(v) => handleFooterColorChange(mode, 'subscribeButtonTextColor', v)} />
                </div>
            </div>
        );
    };
    
    const SectionAdSettings = ({ sectionName, adScripts, onChange }: { sectionName: string, adScripts: { top?: string, bottom?: string }, onChange: (key: 'topAdScript' | 'bottomAdScript', value: string) => void }) => (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ad-codes" className="border-b-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        Ad Codes for {sectionName}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <div>
                        <Label>Top Ad Script</Label>
                        <Textarea
                            placeholder={`<!-- Ad code before ${sectionName} -->`}
                            value={adScripts.top || ''}
                            onChange={(e) => onChange('topAdScript', e.target.value)}
                            className="font-mono text-xs"
                            rows={4}
                        />
                    </div>
                    <div>
                        <Label>Bottom Ad Script</Label>
                        <Textarea
                            placeholder={`<!-- Ad code after ${sectionName} -->`}
                            value={adScripts.bottom || ''}
                            onChange={(e) => onChange('bottomAdScript', e.target.value)}
                            className="font-mono text-xs"
                            rows={4}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );

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
                                Global Ad Code
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
                                        placeholder="&lt;script&gt;...&lt;/script&gt;"
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
                                        <h4 className="font-semibold">Badge &amp; Button Settings</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Badge Text</Label>
                                                <Input value={config.hero?.badgeText || ''} onChange={(e) => handleHeroChange('badgeText', e.target.value)} />
                                            </div>
                                             <div className="space-y-2">
                                                <Label>Hero Button Text</Label>
                                                <Input value={config.hero?.heroButtonText || ''} onChange={(e) => handleHeroChange('heroButtonText', e.target.value)} placeholder="e.g., Start Reading" />
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
                                    <SectionAdSettings sectionName="Hero" adScripts={{ top: config.hero.topAdScript, bottom: config.hero.bottomAdScript }} onChange={(key, value) => handleHeroChange(key, value)} />
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
                                        <div className="space-y-2">
                                            <Label>Header Alignment</Label>
                                            <Select value={config.latestPostsGrid.headerAlignment || 'left'} onValueChange={(v) => handleLatestGridChange('headerAlignment', v as any)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="left">Left</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="right">Right</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                    <SectionAdSettings sectionName="Latest Posts" adScripts={{ top: config.latestPostsGrid.topAdScript, bottom: config.latestPostsGrid.bottomAdScript }} onChange={(key, value) => handleLatestGridChange(key, value)} />

                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    
                     <AccordionItem value="categories-section">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <FolderKanban className="h-5 w-5 text-primary" />
                                Categories Section
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="enable-categories-section" className="font-semibold">Enable Categories Section</Label>
                                </div>
                                <Switch
                                    id="enable-categories-section"
                                    checked={config.categoriesSection?.enabled}
                                    onCheckedChange={(checked) => handleCategoriesSectionChange('enabled', checked)}
                                />
                            </div>
                            
                            {config.categoriesSection?.enabled && (
                                <>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Section Header</h4>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={config.categoriesSection.headerText || ''} onChange={(e) => handleCategoriesSectionChange('headerText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input value={config.categoriesSection.descriptionText || ''} onChange={(e) => handleCategoriesSectionChange('descriptionText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Header Alignment</Label>
                                            <Select value={config.categoriesSection.headerAlignment || 'left'} onValueChange={(v) => handleCategoriesSectionChange('headerAlignment', v as any)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="left">Left</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="right">Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Category Slots</h4>
                                        <div className="space-y-4">
                                            {config.categoriesSection?.categorySlots?.map((slot, index) => (
                                                <div key={index} className="space-y-3 rounded-md border p-3">
                                                    <h5 className="font-medium">Category {index + 1}</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Category Name</Label>
                                                            <Input value={slot.name} onChange={(e) => handleCategorySlotChange(index, 'name', e.target.value)} />
                                                        </div>
                                                        <ColorInput label="Category Title Color" value={slot.color || ''} onChange={(v) => handleCategorySlotChange(index, 'color', v)} />
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => openPostSelector(10, 'categories-section', 0, index)}>
                                                        Select Posts ({slot.postIds?.length || 0})
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <CategoriesSectionColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <CategoriesSectionColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                    <SectionAdSettings sectionName="Categories" adScripts={{ top: config.categoriesSection.topAdScript, bottom: config.categoriesSection.bottomAdScript }} onChange={(key, value) => handleCategoriesSectionChange(key, value)} />
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="dual-system-section">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <Columns className="h-5 w-5 text-primary" />
                                Dual System Section
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="enable-dual-system-section" className="font-semibold">Enable Dual System Section</Label>
                                </div>
                                <Switch
                                    id="enable-dual-system-section"
                                    checked={config.dualSystemSection?.enabled}
                                    onCheckedChange={(checked) => handleDualSystemChange('enabled', checked)}
                                />
                            </div>
                            
                            {config.dualSystemSection?.enabled && (
                                <>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">System Part 1</h4>
                                        <div className="space-y-2">
                                            <Label>Header Text</Label>
                                            <Input value={config.dualSystemSection.part1?.headerText || ''} onChange={(e) => handleDualSystemPartChange('part1', 'headerText', e.target.value)} />
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <Button variant="outline" onClick={() => openPostSelector(1, 'dual-system-featured', 1)}>Select Featured Post</Button>
                                            <Button variant="outline" onClick={() => openPostSelector(5, 'dual-system-side', 1)}>Select Side Posts ({config.dualSystemSection.part1?.sidePostIds?.length || 0}/5)</Button>
                                            <Button variant="outline" onClick={() => openPostSelector(4, 'dual-system-bottom', 1)}>Select Bottom Posts ({config.dualSystemSection.part1?.bottomPostIds?.length || 0}/4)</Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Show More Button Text</Label>
                                            <Input value={config.dualSystemSection.part1?.showMoreText || ''} onChange={(e) => handleDualSystemPartChange('part1', 'showMoreText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Show More Button Link</Label>
                                            <Input value={config.dualSystemSection.part1?.showMoreLink || ''} onChange={(e) => handleDualSystemPartChange('part1', 'showMoreLink', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">System Part 2</h4>
                                        <div className="space-y-2">
                                            <Label>Header Text</Label>
                                            <Input value={config.dualSystemSection.part2?.headerText || ''} onChange={(e) => handleDualSystemPartChange('part2', 'headerText', e.target.value)} />
                                        </div>
                                         <div className="flex flex-wrap gap-4">
                                            <Button variant="outline" onClick={() => openPostSelector(1, 'dual-system-featured', 2)}>Select Featured Post</Button>
                                            <Button variant="outline" onClick={() => openPostSelector(5, 'dual-system-side', 2)}>Select Side Posts ({config.dualSystemSection.part2?.sidePostIds?.length || 0}/5)</Button>
                                            <Button variant="outline" onClick={() => openPostSelector(4, 'dual-system-bottom', 2)}>Select Bottom Posts ({config.dualSystemSection.part2?.bottomPostIds?.length || 0}/4)</Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Show More Button Text</Label>
                                            <Input value={config.dualSystemSection.part2?.showMoreText || ''} onChange={(e) => handleDualSystemPartChange('part2', 'showMoreText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Show More Button Link</Label>
                                            <Input value={config.dualSystemSection.part2?.showMoreLink || ''} onChange={(e) => handleDualSystemPartChange('part2', 'showMoreLink', e.target.value)} />
                                        </div>
                                    </div>
                                    
                                    <DualSystemColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <DualSystemColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                    <SectionAdSettings sectionName="Dual System" adScripts={{ top: config.dualSystemSection.topAdScript, bottom: config.dualSystemSection.bottomAdScript }} onChange={(key, value) => handleDualSystemChange(key, value)} />
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="recent-posts-section">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <AppWindow className="h-5 w-5 text-primary" />
                                Recent Posts Section
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="enable-recent-posts" className="font-semibold">Enable Recent Posts Section</Label>
                                </div>
                                <Switch
                                    id="enable-recent-posts"
                                    checked={config.recentPostsSection?.enabled}
                                    onCheckedChange={(checked) => handleRecentPostsChange('enabled', checked)}
                                />
                            </div>

                            {config.recentPostsSection?.enabled && (
                                <>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Section Header</h4>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={config.recentPostsSection.headerText || ''} onChange={(e) => handleRecentPostsChange('headerText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input value={config.recentPostsSection.descriptionText || ''} onChange={(e) => handleRecentPostsChange('descriptionText', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Header Alignment</Label>
                                            <Select value={config.recentPostsSection.headerAlignment || 'left'} onValueChange={(v) => handleRecentPostsChange('headerAlignment', v as any)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="left">Left</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="right">Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Content &amp; Pagination</h4>
                                        <div className="space-y-2">
                                            <Label>Posts</Label>
                                            <Button variant="outline" onClick={() => openPostSelector(100, 'recent-posts-section')}>
                                                Select Posts ({config.recentPostsSection?.postIds?.length || 0})
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Initial Posts to Show</Label>
                                                <Input type="number" value={config.recentPostsSection?.initialPostsToShow} onChange={(e) => handleRecentPostsChange('initialPostsToShow', parseInt(e.target.value, 10))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Posts to Load per Click</Label>
                                                <Input type="number" value={config.recentPostsSection?.postsPerLoad} onChange={(e) => handleRecentPostsChange('postsPerLoad', parseInt(e.target.value, 10))} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Show More Button Text</Label>
                                            <Input value={config.recentPostsSection?.showMoreButtonText || 'Show More'} onChange={(e) => handleRecentPostsChange('showMoreButtonText', e.target.value)} />
                                        </div>
                                    </div>
                                    <RecentPostsColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <RecentPostsColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                    <SectionAdSettings sectionName="Recent Posts" adScripts={{ top: config.recentPostsSection.topAdScript, bottom: config.recentPostsSection.bottomAdScript }} onChange={(key, value) => handleRecentPostsChange(key, value)} />
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="footer-section">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <Footprints className="h-5 w-5 text-primary" />
                                Footer Section
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="enable-footer" className="font-semibold">Enable Footer Section</Label>
                                </div>
                                <Switch
                                    id="enable-footer"
                                    checked={config.footer?.enabled}
                                    onCheckedChange={(checked) => handleFooterChange('enabled', checked)}
                                />
                            </div>

                            {config.footer?.enabled && (
                                <>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Footer Content</h4>
                                         <div className="space-y-2">
                                            <Label>Newsletter Title</Label>
                                            <Input value={config.footer.newsletterTitle || ''} onChange={(e) => handleFooterChange('newsletterTitle', e.target.value)} placeholder="Subscribe to our Newsletter" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Newsletter Description</Label>
                                            <Textarea value={config.footer.newsletterDescription || ''} onChange={(e) => handleFooterChange('newsletterDescription', e.target.value)} rows={2} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Subscribe Button Text</Label>
                                            <Input value={config.footer.subscribeButtonText || ''} onChange={(e) => handleFooterChange('subscribeButtonText', e.target.value)} placeholder="Subscribe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>About Text</Label>
                                            <Textarea value={config.footer.aboutText || ''} onChange={(e) => handleFooterChange('aboutText', e.target.value)} rows={4} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Copyright Text</Label>
                                            <Textarea value={config.footer.copyrightText || ''} onChange={(e) => handleFooterChange('copyrightText', e.target.value)} rows={3} />
                                        </div>
                                    </div>
                                     <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Social Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Facebook URL</Label><Input value={config.footer.socialLinks?.facebook || ''} onChange={(e) => handleFooterChange('socialLinks', {...config.footer?.socialLinks, facebook: e.target.value})} /></div>
                                            <div className="space-y-2"><Label>Twitter URL</Label><Input value={config.footer.socialLinks?.twitter || ''} onChange={(e) => handleFooterChange('socialLinks', {...config.footer?.socialLinks, twitter: e.target.value})} /></div>
                                            <div className="space-y-2"><Label>Instagram URL</Label><Input value={config.footer.socialLinks?.instagram || ''} onChange={(e) => handleFooterChange('socialLinks', {...config.footer?.socialLinks, instagram: e.target.value})} /></div>
                                            <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={config.footer.socialLinks?.linkedin || ''} onChange={(e) => handleFooterChange('socialLinks', {...config.footer?.socialLinks, linkedin: e.target.value})} /></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <h4 className="font-semibold">Footer Menu</h4>
                                        {config.footer.menuColumns?.map((col, colIndex) => (
                                            <div key={col.id} className="space-y-3 rounded-md border p-3">
                                                <div className="flex justify-between items-center">
                                                    <Input className="font-medium text-base" value={col.title} onChange={(e) => handleFooterMenuChange(colIndex, 'title', e.target.value)} />
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFooterMenuColumn(col.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                                {col.links?.map((link, linkIndex) => (
                                                    <div key={link.id} className="flex items-center gap-2">
                                                        <Input placeholder="Link Name" value={link.name} onChange={(e) => handleFooterMenuLinkChange(colIndex, linkIndex, 'name', e.target.value)} />
                                                        <Input placeholder="/path or https://..." value={link.value} onChange={(e) => handleFooterMenuLinkChange(colIndex, linkIndex, 'value', e.target.value)} />
                                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeFooterMenuLink(colIndex, link.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" onClick={() => addFooterMenuLink(colIndex)}>Add Link</Button>
                                            </div>
                                        ))}
                                        <Button variant="secondary" onClick={addFooterMenuColumn}>Add Menu Column</Button>
                                    </div>
                                    <FooterColorSettings mode="light" isVisible={config.themeMode === 'light'} />
                                    <FooterColorSettings mode="dark" isVisible={config.themeMode === 'dark'} />
                                     <SectionAdSettings sectionName="Footer" adScripts={{ top: config.footer.topAdScript, bottom: config.footer.bottomAdScript }} onChange={(key, value) => handleFooterChange(key, value)} />
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
                        : postSelectorConfig.target === 'categories-section' && postSelectorConfig.categoryIndex !== -1
                        ? (config.categoriesSection?.categorySlots?.[postSelectorConfig.categoryIndex]?.postIds || [])
                        : postSelectorConfig.target === 'recent-posts-section'
                        ? (config.recentPostsSection?.postIds || [])
                        : postSelectorConfig.target.startsWith('dual-system-')
                        ? (() => {
                            const partKey = postSelectorConfig.part === 1 ? 'part1' : 'part2';
                            const partConfig = config.dualSystemSection?.[partKey];
                            if (!partConfig) return [];

                            if (postSelectorConfig.target.endsWith('-featured')) {
                                return partConfig.featuredPostId ? [partConfig.featuredPostId] : [];
                            }
                            if (postSelectorConfig.target.endsWith('-side')) {
                                return partConfig.sidePostIds || [];
                            }
                             if (postSelectorConfig.target.endsWith('-bottom')) {
                                return partConfig.bottomPostIds || [];
                            }
                            return [];
                          })()
                        : []
                }
                selectionLimit={postSelectorConfig.limit}
            />
        </Card>
    );
}

const templateDefinitions = [
    {
        id: 'tech-template-01',
        title: 'Tech Template 01',
        description: 'Configure the settings for the primary technology-focused landing page template.'
    },
    {
        id: 'travel-template-01',
        title: 'Travel Template 01',
        description: 'Configure the settings for the new travel-focused landing page template.'
    },
    {
        id: 'pets-01',
        title: 'Pets Template 01',
        description: 'Configure the settings for the new pets-focused landing page template.'
    },
    {
        id: 'food-01',
        title: 'Food & Recipes Template 01',
        description: 'Configure the settings for the new food-focused landing page template.'
    },
    {
        id: 'education-01',
        title: 'Education Template 01',
        description: 'Configure the settings for the new education-focused landing page template.'
    },
    {
        id: 'finance-01',
        title: 'Finance & Money Template 01',
        description: 'Configure the settings for the new finance-focused landing page template.'
    }
];

export default function TemplateSetupPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<TemplateConfig[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadAllTemplateConfigs() {
            setIsLoading(true);
            const configs: TemplateConfig[] = [];
            let activeId: string | null = null;

            for (const def of templateDefinitions) {
                const result = await getTemplateConfigAction(def.id);
                let config: Partial<TemplateConfig> = {};
                
                if (result.success && result.data) {
                    config = result.data;
                    if (config.isActive) {
                        activeId = def.id;
                    }
                }

                // Ensure default structure
                const fullConfig: TemplateConfig = {
                    id: def.id,
                    isActive: config.isActive || false,
                    themeMode: config.themeMode || 'light',
                    header: config.header || { menuItems: [] },
                    ads: config.ads || {},
                    hero: config.hero || { enabled: false, sidePostIds: [], lightModeColors: {}, darkModeColors: {}, badgeText: 'FEATURED', randomImageUrls: [], randomAuthorNames: [] },
                    latestPostsGrid: config.latestPostsGrid || { enabled: false, mode: 'automatic', postLimit: 6, lightModeColors: {}, darkModeColors: {}},
                    categoriesSection: config.categoriesSection || { enabled: false, categorySlots: Array(5).fill(null).map((_, i) => ({ name: `Category ${i+1}`, postIds: [] })), lightModeColors: {}, darkModeColors: {}},
                    dualSystemSection: config.dualSystemSection || { enabled: false, part1: { sidePostIds: [], bottomPostIds: [] }, part2: { sidePostIds: [], bottomPostIds: [] }, lightModeColors: {}, darkModeColors: {} },
                    recentPostsSection: config.recentPostsSection || { enabled: false, lightModeColors: {}, darkModeColors: {}, postIds: [], initialPostsToShow: 6, postsPerLoad: 6 },
                    footer: config.footer || { enabled: false, aboutText: '', copyrightText: `© ${new Date().getFullYear()} All rights reserved.`, socialLinks: {}, menuColumns: [ { id: `col-${Date.now()}`, title: 'New Column', links: [{id: `link-${Date.now()}`, name: 'New Link', value: '#'}] } ] }
                };

                configs.push(fullConfig);
            }

            setTemplates(configs);
            setActiveTemplateId(activeId);
            setIsLoading(false);
        }

        loadAllTemplateConfigs();
    }, []);

    const handleSetActiveTemplate = async (templateId: string) => {
        if (!templateId) return;
        setIsSaving(true);
        const result = await setActiveTemplateAction(templateId);
        if (result.success) {
            setActiveTemplateId(templateId);
            toast({ title: 'Success', description: 'Active template has been updated.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
             <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <Skeleton className="h-12 w-full" />
                    </CardHeader>
                </Card>
                 <Card>
                     <CardHeader>
                        <Skeleton className="h-12 w-full" />
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Active Template Configuration</CardTitle>
                    <CardDescription>Select the template to display on your main page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-xs">
                        <Select onValueChange={handleSetActiveTemplate} value={activeTemplateId || ''} disabled={isSaving}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an active template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templateDefinitions.map(def => (
                                    <SelectItem key={def.id} value={def.id}>{def.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full space-y-8">
                 {templates.map(template => {
                    const def = templateDefinitions.find(d => d.id === template.id)!;
                    return (
                        <AccordionItem value={template.id} key={template.id} className="border-b-0">
                             <AccordionTrigger className="w-full p-4 bg-card rounded-lg border text-lg font-semibold hover:no-underline">
                                {def.title}
                            </AccordionTrigger>
                             <AccordionContent className="pt-4">
                                <TemplateSection
                                    template={template}
                                    title={def.title}
                                    description={def.description}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    )
                 })}
            </Accordion>
        </div>
    );
}
