
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AutoBloggerSetupPage() {
    const [isSaving, setIsSaving] = useState(false);

    // In a real application, you would use useState for each form field
    // and handle form submission to save the configuration.

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
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
                                <Input id="category" placeholder="e.g., Technology, Health, Finance" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="keywords">SEO Keywords</Label>
                                <Input id="keywords" placeholder="e.g., AI, machine learning, innovation" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paragraphs">Paragraphs per Post</Label>
                                <Input id="paragraphs" type="number" placeholder="e.g., 5" defaultValue="5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="words">Words per Post</Label>
                                <Input id="words" type="number" placeholder="e.g., 800" defaultValue="800" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Scheduling & Publishing</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="timer">Generation Frequency</Label>
                                <Select defaultValue="10-min">
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
                                <RadioGroup defaultValue="draft" className="flex items-center gap-4 pt-2">
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
                           <Switch id="ai-image" defaultChecked />
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
