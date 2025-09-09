
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { 
    generateKeywordsAction, 
    saveApiKeysAction, 
    generateAutoBlogPostAction, 
    getApiKeyStatusAction,
    saveAutoBloggerConfigAction,
    getAutoBloggerConfigAction,
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Bot, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { AutoBloggerConfig } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ApiKeyForm() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [imagebbApiKey, setImagebbApiKey] = useState('');

    const [geminiKeyIsSet, setGeminiKeyIsSet] = useState(false);
    const [imagebbKeyIsSet, setImagebbKeyIsSet] = useState(false);

    useEffect(() => {
        const checkApiKeyStatus = async () => {
            setIsLoadingStatus(true);
            const result = await getApiKeyStatusAction();
            if (result.success) {
                setGeminiKeyIsSet(result.data.geminiKeySet);
                setImagebbKeyIsSet(result.data.imagebbKeySet);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Error checking API key status',
                    description: result.error,
                });
            }
            setIsLoadingStatus(false);
        };
        checkApiKeyStatus();
    }, [toast]);


    const handleSave = async () => {
        setIsSaving(true);
        const result = await saveApiKeysAction({
            geminiApiKey,
            imagebbApiKey,
        });

        if (result.success) {
            toast({
                title: 'API Keys Saved',
                description: 'Your API keys have been saved successfully.',
            });
            if (geminiApiKey) setGeminiKeyIsSet(true);
            if (imagebbApiKey) setImagebbKeyIsSet(true);
            setGeminiApiKey('');
            setImagebbApiKey('');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error Saving Keys',
                description: result.error,
            });
        }
        setIsSaving(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Key Configuration</CardTitle>
                <CardDescription>Manage API keys for third-party services used in your project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">Google Gemini API Key</h3>
                    <p className="text-sm text-muted-foreground">
                        This key is required for all AI content generation features.
                    </p>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>.</li>
                        <li>Click on "Create API key in new project".</li>
                        <li>Copy the generated API key and paste it below.</li>
                    </ol>
                    {isLoadingStatus ? <Skeleton className="h-10 w-full" /> : (
                        geminiKeyIsSet && !geminiApiKey ? (
                             <div className="flex items-center gap-4">
                                <Input disabled value="••••••••••••••••••••" type="password" />
                                <Button variant="secondary" onClick={() => setGeminiKeyIsSet(false)}>Update</Button>
                            </div>
                        ) : (
                            <Input 
                                id="gemini-api-key" 
                                type="password"
                                placeholder="Enter your Gemini API Key" 
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                            />
                        )
                    )}
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">ImageBB API Key</h3>
                    <p className="text-sm text-muted-foreground">
                        This key is required to host AI-generated images.
                    </p>
                     <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                        <li>Go to <a href="https://api.imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">ImageBB API page</a>.</li>
                        <li>Click "Get API Key" and sign up or log in.</li>
                        <li>Copy your API v1 key and paste it below.</li>
                    </ol>
                     {isLoadingStatus ? <Skeleton className="h-10 w-full" /> : (
                        imagebbKeyIsSet && !imagebbApiKey ? (
                             <div className="flex items-center gap-4">
                                <Input disabled value="••••••••••••••••••••" type="password" />
                                <Button variant="secondary" onClick={() => setImagebbKeyIsSet(false)}>Update</Button>
                            </div>
                        ) : (
                            <Input 
                                id="imagebb-api-key"
                                type="password" 
                                placeholder="Enter your ImageBB API Key" 
                                value={imagebbApiKey}
                                onChange={(e) => setImagebbApiKey(e.target.value)}
                            />
                        )
                     )}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving || isLoadingStatus || (!geminiApiKey && !imagebbApiKey)}>
                    {isSaving ? <Loader2 className="animate-spin" /> : "Save API Keys"}
                </Button>
            </CardFooter>
        </Card>
    );
}

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

export default function AutoBloggerSetupPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
    const [isGeneratingManually, setIsGeneratingManually] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const [quotaResetTime, setQuotaResetTime] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);


    useEffect(() => {
        if (!quotaResetTime) return;

        const calculateTimeRemaining = () => {
            const remaining = new Date(quotaResetTime).getTime() - new Date().getTime();
            if (remaining > 0) {
                setTimeRemaining(remaining / 1000);
            } else {
                setTimeRemaining(null);
                setQuotaResetTime(null);
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [quotaResetTime]);

    // Form State
    const [category, setCategory] = useState('');
    const [keywordMode, setKeywordMode] = useState<'auto' | 'manual'>('auto');
    const [manualKeywords, setManualKeywords] = useState('');
    const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
    const [useRandomKeyword, setUseRandomKeyword] = useState(false);
    const [titleMode, setTitleMode] = useState<'auto' | 'manual'>('auto');
    const [manualTitle, setManualTitle] = useState('');
    const [paragraphs, setParagraphs] = useState('5');
    const [words, setWords] = useState('800');
    const [frequency, setFrequency] = useState('10-min');
    const [publishAction, setPublishAction] = useState<'draft' | 'publish'>('draft');
    const [contentAlignment, setContentAlignment] = useState<'left' | 'center' | 'full'>('left');
    const [inContentImages, setInContentImages] = useState('none');
    const [inContentImagesAlignment, setInContentImagesAlignment] = useState<'center' | 'all-left' | 'all-right' | 'alternate-left' | 'alternate-right'>('center');
    const [paragraphSpacing, setParagraphSpacing] = useState<'small' | 'medium' | 'large'>('medium');
    
    // Featured Image State
    const [featuredImageMode, setFeaturedImageMode] = useState<'ai' | 'random' | 'none'>('ai');
    const [randomImageUrlList, setRandomImageUrlList] = useState('');

    // Background Image State
    const [backgroundImageMode, setBackgroundImageMode] = useState<'ai' | 'random' | 'none'>('none');
    const [randomBgImageUrlList, setRandomBgImageUrlList] = useState('');

    // In-Content Image State
    const [inContentImagesMode, setInContentImagesMode] = useState<'ai' | 'random' | 'none'>('none');
    const [randomInContentImageUrlList, setRandomInContentImageUrlList] = useState('');
    
    // Watermark State
    const [websiteNameWatermark, setWebsiteNameWatermark] = useState('');

    // Tags State
    const [addTags, setAddTags] = useState(false);
    const [tagGenerationMode, setTagGenerationMode] = useState<'auto' | 'manual'>('auto');
    const [manualTags, setManualTags] = useState('');
    const [numberOfTags, setNumberOfTags] = useState('5');

    // Comments State
    const [enableComments, setEnableComments] = useState(true);


    useEffect(() => {
        async function loadConfig() {
            setIsLoadingConfig(true);
            const result = await getAutoBloggerConfigAction();
            if (result.success && result.data) {
                const config = result.data;
                setCategory(config.category);
                setKeywordMode(config.keywordMode);
                if (config.keywordMode === 'manual') {
                    setManualKeywords(config.keywords.join(', '));
                } else {
                    setGeneratedKeywords(config.keywords);
                }
                setTitleMode(config.titleMode || 'auto');
                setManualTitle(config.manualTitle || '');
                setUseRandomKeyword(config.useRandomKeyword || false);
                setParagraphs(config.paragraphs);
                setWords(config.words);
                setFrequency(config.frequency);
                setPublishAction(config.publishAction);
                
                setFeaturedImageMode(config.featuredImageMode || 'ai');
                setRandomImageUrlList(config.randomImageUrlList?.join('\n') || '');

                setBackgroundImageMode(config.backgroundImageMode || 'none');
                setRandomBgImageUrlList(config.randomBgImageUrlList?.join('\n') || '');
                
                setInContentImagesMode(config.inContentImagesMode || 'none');
                setRandomInContentImageUrlList(config.randomInContentImageUrlList?.join('\n') || '');

                setWebsiteNameWatermark(config.websiteNameWatermark || '');
                setContentAlignment(config.contentAlignment || 'left');
                setInContentImages(config.inContentImages || 'none');
                setInContentImagesAlignment(config.inContentImagesAlignment || 'center');
                setParagraphSpacing(config.paragraphSpacing || 'medium');

                setAddTags(config.addTags || false);
                setTagGenerationMode(config.tagGenerationMode || 'auto');
                setManualTags(config.manualTags?.join(', ') || '');
                setNumberOfTags(config.numberOfTags || '5');

                setEnableComments(config.enableComments !== false); // Default to true if not set
            } else if (result.success && !result.data) {
                // No config found, use defaults
            } else if(result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Failed to load configuration',
                    description: result.error,
                });
            }
            setIsLoadingConfig(false);
        }
        loadConfig();
    }, [toast]);
    
    const handleGenerateKeywords = async () => {
        if (!category) {
            toast({
                variant: 'destructive',
                title: 'Please select a category first.',
            });
            return;
        }
        setIsGeneratingKeywords(true);
        const result = await generateKeywordsAction({ category });
        if (result.success) {
            setGeneratedKeywords(result.data.keywords);
            toast({ title: 'Keywords generated successfully!' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to generate keywords.',
                description: result.error,
            });
        }
        setIsGeneratingKeywords(false);
    };

    const handleSaveConfiguration = async () => {
        setIsSavingConfig(true);
        const keywords = keywordMode === 'auto' ? generatedKeywords : manualKeywords.split(',').map(kw => kw.trim()).filter(Boolean);
        
        const config: AutoBloggerConfig = {
            category,
            keywordMode,
            keywords,
            titleMode,
            manualTitle,
            useRandomKeyword,
            paragraphs,
            words,
            frequency,
            publishAction,
            featuredImageMode,
            randomImageUrlList: randomImageUrlList.split('\n').map(url => url.trim()).filter(Boolean),
            backgroundImageMode,
            randomBgImageUrlList: randomBgImageUrlList.split('\n').map(url => url.trim()).filter(Boolean),
            inContentImagesMode,
            randomInContentImageUrlList: randomInContentImageUrlList.split('\n').map(url => url.trim()).filter(Boolean),
            websiteNameWatermark,
            contentAlignment,
            inContentImages,
            inContentImagesAlignment,
            paragraphSpacing,
            addTags,
            tagGenerationMode,
            manualTags: manualTags.split(',').map(t => t.trim()).filter(Boolean),
            numberOfTags,
            enableComments,
        };

        const result = await saveAutoBloggerConfigAction(config);

        if (result.success) {
            toast({
                title: 'Configuration Saved',
                description: 'Your auto blogger settings have been saved.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Failed to save configuration',
                description: result.error,
            });
        }
        setIsSavingConfig(false);
    };
    
    const handleManualRun = async () => {
        setIsGeneratingManually(true);
        
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to generate a post.',
            });
            setIsGeneratingManually(false);
            return;
        }
        
        const keywords = keywordMode === 'auto' ? generatedKeywords.join(', ') : manualKeywords;
        if (!category || !keywords) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide a category and keywords before generating a post.',
            });
            setIsGeneratingManually(false);
            return;
        }

        const input: GenerateAutoBlogPostInput = {
            userId: user.uid,
            category,
            keywords,
            titleMode,
            manualTitle,
            useRandomKeyword: keywordMode === 'auto' && useRandomKeyword,
            paragraphs,
            words,
            publishAction,
            featuredImageMode,
            randomImageUrlList: randomImageUrlList.split('\n').map(url => url.trim()).filter(Boolean),
            backgroundImageMode,
            randomBgImageUrlList: randomBgImageUrlList.split('\n').map(url => url.trim()).filter(Boolean),
            inContentImagesMode,
            randomInContentImageUrlList: randomInContentImageUrlList.split('\n').map(url => url.trim()).filter(Boolean),
            websiteNameWatermark,
            contentAlignment,
            inContentImages,
            inContentImagesAlignment,
            paragraphSpacing,
            addTags,
            tagGenerationMode,
            manualTags: manualTags.split(',').map(t => t.trim()).filter(Boolean),
            numberOfTags,
            enableComments,
        };

        const result = await generateAutoBlogPostAction(input);

        if (result.success) {
            toast({
                title: 'Manual Run Complete',
                description: `A new blog post (ID: ${result.data.articleId}) has been generated and saved.`,
            });
        } else {
            if (result.data?.resetsAt) {
                setQuotaResetTime(result.data.resetsAt);
            }
            toast({
                variant: 'destructive',
                title: 'Manual Run Failed',
                description: result.error,
            });
        }

        setIsGeneratingManually(false);
    };

    if (isLoadingConfig) {
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
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <ApiKeyForm />
            <Card>
                <CardHeader>
                    <CardTitle>Auto Blogger Configuration</CardTitle>
                    <CardDescription>Set up the parameters for automated blog post generation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Content Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={setCategory} value={category}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="health">Health & Wellness</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                        <SelectItem value="travel">Travel</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>SEO Keywords</Label>
                                 <RadioGroup value={keywordMode} onValueChange={(value) => setKeywordMode(value as any)} className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="auto" id="r-auto" />
                                        <Label htmlFor="r-auto">Automated</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="manual" id="r-manual" />
                                        <Label htmlFor="r-manual">Manual</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {keywordMode === 'manual' && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="keywords">Manual Keywords</Label>
                                    <Input id="keywords" placeholder="e.g., AI, machine learning, innovation" value={manualKeywords} onChange={(e) => setManualKeywords(e.target.value)} />
                                </div>
                            )}

                            {keywordMode === 'auto' && (
                                <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4 md:col-span-2">
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">Automated Keywords</h4>
                                            <p className="text-sm text-muted-foreground">Keywords will be generated based on the selected category.</p>
                                        </div>
                                        <Button onClick={handleGenerateKeywords} disabled={isGeneratingKeywords || !category} size="sm" variant="outline">
                                            {isGeneratingKeywords ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                                            Regenerate
                                        </Button>
                                    </div>
                                    {generatedKeywords.length > 0 && (
                                        <>
                                            <div className="flex flex-wrap gap-2">
                                                {generatedKeywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                               <div>
                                                 <Label htmlFor="random-keyword" className="font-semibold">Use Random Keyword per Post</Label>
                                                 <p className="text-sm text-muted-foreground">
                                                    If enabled, one keyword will be chosen randomly from the list for each post.
                                                 </p>
                                               </div>
                                               <Switch id="random-keyword" checked={useRandomKeyword} onCheckedChange={setUseRandomKeyword} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2 md:col-span-2">
                                <Label>Title Generation</Label>
                                <RadioGroup value={titleMode} onValueChange={(value) => setTitleMode(value as any)} className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="auto" id="t-auto" />
                                        <Label htmlFor="t-auto">Automated</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="manual" id="t-manual" />
                                        <Label htmlFor="t-manual">Manual</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            
                            {titleMode === 'manual' && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="manual-title">Manual Title</Label>
                                    <Input 
                                        id="manual-title" 
                                        placeholder="Enter the exact title for the blog post" 
                                        value={manualTitle} 
                                        onChange={(e) => setManualTitle(e.target.value)} 
                                    />
                                </div>
                            )}


                            <div className="space-y-2">
                                <Label htmlFor="paragraphs">Paragraphs per Post</Label>
                                <Input id="paragraphs" type="number" placeholder="e.g., 5" value={paragraphs} onChange={(e) => setParagraphs(e.target.value)} />
                                <p className="text-xs text-muted-foreground pt-1">
                                    Recommended: 5-20 paragraphs for best quality.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="words">Words per Post</Label>
                                <Input id="words" type="number" placeholder="e.g., 800" value={words} onChange={(e) => setWords(e.target.value)} />
                                <p className="text-xs text-muted-foreground pt-1">
                                    Recommended: 500-3000 words for best quality.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Scheduling & Publishing</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="timer">Generation Frequency</Label>
                                <Select value={frequency} onValueChange={setFrequency}>
                                    <SelectTrigger id="timer">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5-min">Every 5 minutes</SelectItem>
                                        <SelectItem value="10-min">Every 10 minutes</SelectItem>
                                        <SelectItem value="30-min">Every 30 minutes</SelectItem>
                                        <SelectItem value="1-hour">Every hour</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Publishing Action</Label>
                                <RadioGroup value={publishAction} onValueChange={(value) => setPublishAction(value as any)} className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="draft" id="r-draft" />
                                        <Label htmlFor="r-draft">Save as Draft</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="publish" id="r-publish" />
                                        <Label htmlFor="r-publish">Auto Publish</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Layout & Style Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                             <div className="space-y-4 rounded-lg border p-4 md:col-span-2">
                                <div className="flex items-center justify-between">
                                   <div>
                                     <Label htmlFor="enable-comments" className="font-semibold">Enable Comments</Label>
                                     <p className="text-sm text-muted-foreground">
                                        Allow users to comment on newly generated posts.
                                     </p>
                                   </div>
                                   <Switch id="enable-comments" checked={enableComments} onCheckedChange={setEnableComments} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Media Settings</h3>
                        <div className="space-y-2 rounded-lg border p-4">
                           <Label className="font-semibold">Website Name Watermark</Label>
                           <Input 
                                id="watermark" 
                                placeholder="e.g., MyAwesomeSite.com" 
                                value={websiteNameWatermark}
                                onChange={(e) => setWebsiteNameWatermark(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground pt-1">
                                Text to be added as a watermark on all AI-generated images. Leave blank for no watermark.
                            </p>
                        </div>
                        <div className="space-y-4 rounded-lg border p-4">
                           <Label className="font-semibold">Featured Image</Label>
                             <RadioGroup value={featuredImageMode} onValueChange={(value) => setFeaturedImageMode(value as any)} className="flex items-center gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ai" id="fi-ai" />
                                    <Label htmlFor="fi-ai">AI Generated</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="random" id="fi-random" />
                                    <Label htmlFor="fi-random">Random from List</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="fi-none" />
                                    <Label htmlFor="fi-none">None</Label>
                                </div>
                            </RadioGroup>
                            {featuredImageMode === 'random' && (
                                <div className="space-y-2 border-t pt-4">
                                    <Label htmlFor="image-url-list">Image URL List</Label>
                                    <Textarea 
                                        id="image-url-list"
                                        placeholder="Paste one image URL per line."
                                        value={randomImageUrlList}
                                        onChange={(e) => setRandomImageUrlList(e.target.value)}
                                        rows={5}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The system will randomly pick one URL from this list for each new post.
                                    </p>
                                </div>
                            )}
                        </div>
                         <div className="space-y-4 rounded-lg border p-4">
                            <Label className="font-semibold">Background Image</Label>
                            <RadioGroup value={backgroundImageMode} onValueChange={(value) => setBackgroundImageMode(value as any)} className="flex items-center gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ai" id="bgi-ai" />
                                    <Label htmlFor="bgi-ai">AI Generated</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="random" id="bgi-random" />
                                    <Label htmlFor="bgi-random">Random from List</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="bgi-none" />
                                    <Label htmlFor="bgi-none">None</Label>
                                </div>
                            </RadioGroup>
                            {backgroundImageMode === 'random' && (
                                <div className="space-y-2 border-t pt-4">
                                    <Label htmlFor="bg-image-url-list">Background Image URL List</Label>
                                    <Textarea 
                                        id="bg-image-url-list"
                                        placeholder="Paste one background image URL per line."
                                        value={randomBgImageUrlList}
                                        onChange={(e) => setRandomBgImageUrlList(e.target.value)}
                                        rows={5}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The system will randomly pick one URL from this list for each new post.
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground pt-2">A dark overlay is automatically applied to background images to ensure text is readable.</p>
                        </div>
                         <div className="space-y-4 rounded-lg border p-4">
                            <Label className="font-semibold">In-Content Images</Label>
                             <RadioGroup value={inContentImagesMode} onValueChange={(value) => setInContentImagesMode(value as any)} className="flex items-center gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ai" id="ici-ai" />
                                    <Label htmlFor="ici-ai">AI Generated</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="random" id="ici-random" />
                                    <Label htmlFor="ici-random">Random from List</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="ici-none" />
                                    <Label htmlFor="ici-none">None</Label>
                                </div>
                            </RadioGroup>

                            {inContentImagesMode !== 'none' && (
                                <div className="space-y-4 border-t pt-4">
                                    {inContentImagesMode === 'random' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="in-content-image-url-list">In-Content Image URL List</Label>
                                            <Textarea 
                                                id="in-content-image-url-list"
                                                placeholder="Paste one image URL per line."
                                                value={randomInContentImageUrlList}
                                                onChange={(e) => setRandomInContentImageUrlList(e.target.value)}
                                                rows={5}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Images will be randomly picked from this list.
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="in-content-images">Image Placement Rules</Label>
                                        <Input 
                                            id="in-content-images" 
                                            placeholder="e.g., every, every-2, 2, 5" 
                                            value={inContentImages}
                                            onChange={(e) => setInContentImages(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground pt-1">
                                            Use 'every', 'every-2', 'every-3', or specify paragraph numbers like '2, 5, 8'.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="in-content-alignment">Image Alignment</Label>
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Post Tags</h3>
                         <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                               <div>
                                 <Label htmlFor="add-tags" className="font-semibold">Add Tags to Posts</Label>
                                 <p className="text-sm text-muted-foreground">
                                    Automatically add #hashtags at the end of your articles.
                                 </p>
                               </div>
                               <Switch id="add-tags" checked={addTags} onCheckedChange={setAddTags} />
                            </div>

                            {addTags && (
                                <div className="space-y-4 border-t pt-4">
                                     <div className="space-y-2">
                                        <Label>Tag Generation</Label>
                                         <RadioGroup value={tagGenerationMode} onValueChange={(value) => setTagGenerationMode(value as any)} className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="auto" id="tag-auto" />
                                                <Label htmlFor="tag-auto">Automated</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="manual" id="tag-manual" />
                                                <Label htmlFor="tag-manual">Manual</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="number-of-tags">Number of Tags</Label>
                                        <Input id="number-of-tags" type="number" placeholder="e.g., 5" value={numberOfTags} onChange={(e) => setNumberOfTags(e.target.value)} />
                                        <p className="text-xs text-muted-foreground pt-1">
                                            The number of tags to add to the post.
                                        </p>
                                    </div>

                                    {tagGenerationMode === 'manual' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="manual-tags">Manual Tags</Label>
                                            <Textarea 
                                                id="manual-tags"
                                                placeholder="Enter tags separated by commas, e.g., tech, ai, future"
                                                value={manualTags}
                                                onChange={(e) => setManualTags(e.target.value)}
                                                rows={3}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                These tags will be used for all posts if manual mode is selected.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                         </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveConfiguration} disabled={isSavingConfig}>
                        {isSavingConfig ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : "Save Configuration"}
                    </Button>
                </CardFooter>
            </Card>

            <Separator />
            
            <Card>
                <CardHeader>
                    <CardTitle>Manual Generation</CardTitle>
                    <CardDescription>Manually trigger a single blog post generation using the saved settings above.</CardDescription>
                </CardHeader>
                <CardContent>
                    {timeRemaining ? (
                        <Alert variant="destructive">
                            <Timer className="h-4 w-4" />
                            <AlertTitle>API Quota Reached</AlertTitle>
                            <AlertDescription>
                                You have hit the daily limit for image generation.
                                Please try again after the timer runs out.
                                <div className="mt-2 font-mono text-lg font-bold">
                                    {formatTime(timeRemaining)}
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <p className="text-sm text-muted-foreground">Click the button below to generate one post immediately. Make sure you have saved your configuration first.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleManualRun} disabled={isGeneratingManually || !user || !!timeRemaining}>
                       {isGeneratingManually ? <><Loader2 className="animate-spin mr-2" /> Generating... (this can take a few minutes)</> : <><Bot className="mr-2" /> Generate Post Manually</>}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
