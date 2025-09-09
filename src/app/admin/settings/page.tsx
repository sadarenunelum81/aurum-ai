
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { saveApiKeysAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [imagebbApiKey, setImagebbApiKey] = useState('');

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
        <div className="flex-1 p-4 md:p-6 lg:p-8">
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
                        <Input 
                            id="gemini-api-key" 
                            type="password"
                            placeholder="Enter your Gemini API Key" 
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                        />
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
                        <Input 
                            id="imagebb-api-key"
                            type="password" 
                            placeholder="Enter your ImageBB API Key" 
                            value={imagebbApiKey}
                            onChange={(e) => setImagebbApiKey(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : "Save API Keys"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
