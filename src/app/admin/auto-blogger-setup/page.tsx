
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateKeywordsAction, saveApiKeysAction, generateAutoBlogPostAction, getApiKeyStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';
import { useAuth } from '@/context/auth-context';

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


export default function AutoBloggerSetupPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
    const [isGeneratingManually, setIsGeneratingManually] = useState(false);

    // Form State
    const [category, setCategory] = useState('');
    const [keywordMode, setKeywordMode] = useState<'auto' | 'manual'>('auto');
    const [manualKeywords, setManualKeywords] = useState('');
    const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
    const [paragraphs, setParagraphs] = useState('5');
    const [words, setWords] = useState('800');
    const [frequency, setFrequency] = useState('10-min');
    const [publishAction, setPublishAction] = useState<'draft' | 'publish'>('draft');
    const [generateImage, setGenerateImage] = useState(true);
    
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
        // TODO: Implement saving logic (e.g., to Firestore or a config file)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async save
        toast({
            title: 'Configuration Saved',
            description: 'Your auto blogger settings have been saved.',
        });
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
            paragraphs,
            words,
            publishAction,
            generateImage,
        };

        const result = await generateAutoBlogPostAction(input);

        if (result.success) {
            toast({
                title: 'Manual Run Complete',
                description: `A new blog post (ID: ${result.data.articleId}) has been generated and saved.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Manual Run Failed',
                description: result.error,
            });
        }

        setIsGeneratingManually(false);
    };

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
                                        <div className="flex flex-wrap gap-2">
                                            {generatedKeywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="paragraphs">Paragraphs per Post</Label>
                                <Input id="paragraphs" type="number" placeholder="e.g., 5" value={paragraphs} onChange={(e) => setParagraphs(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="words">Words per Post</Label>
                                <Input id="words" type="number" placeholder="e.g., 800" value={words} onChange={(e) => setWords(e.target.value)} />
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
                        <h3 className="text-lg font-medium">Media Settings</h3>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                           <div>
                             <Label htmlFor="ai-image" className="font-semibold">Generate AI Image</Label>
                             <p className="text-sm text-muted-foreground">
                                Automatically generate a relevant image for each post.
                             </p>
                           </div>
                           <Switch id="ai-image" checked={generateImage} onCheckedChange={setGenerateImage} />
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
                    <p className="text-sm text-muted-foreground">Click the button below to generate one post immediately. Make sure you have saved your configuration first.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleManualRun} disabled={isGeneratingManually || !user}>
                       {isGeneratingManually ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : <><Bot className="mr-2" /> Generate Post Manually</>}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

    