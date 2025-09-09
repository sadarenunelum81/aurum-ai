
"use client";

import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2 } from 'lucide-react';
import type { OptimizeContentForSEOOutput } from '@/ai/flows/optimize-content-for-seo';

type AIToolsPanelProps = {
  title: string;
  article: string;
  suggestedTitles: string[];
  seoChecklist: OptimizeContentForSEOOutput['seoChecklist'] | null;
  onDraftArticle: () => Promise<void>;
  onAdjustStyle: (tone: string, length: string, complexity: string) => Promise<void>;
  onOptimizeSeo: (keywords: string) => Promise<void>;
  onGenerateTitles: (topic: string) => Promise<void>;
  setArticle: Dispatch<SetStateAction<string>>;
  setTitle: Dispatch<SetStateAction<string>>;
  loadingStates: {
    draft: boolean;
    style: boolean;
    seo: boolean;
    titles: boolean;
  };
};

export function AIToolsPanel({
  title,
  article,
  suggestedTitles,
  seoChecklist,
  onDraftArticle,
  onAdjustStyle,
  onOptimizeSeo,
  onGenerateTitles,
  setTitle,
  loadingStates,
}: AIToolsPanelProps) {

  const [styleTone, setStyleTone] = React.useState('professional');
  const [styleLength, setStyleLength] = React.useState('same');
  const [styleComplexity, setStyleComplexity] = React.useState('same');
  const [seoKeywords, setSeoKeywords] = React.useState('');
  const [titlesTopic, setTitlesTopic] = React.useState('');

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Wand2 className="text-primary size-8" />
          <div>
            <CardTitle className="font-headline">AI Assistant</CardTitle>
            <CardDescription>Enhance your writing with AI</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="draft">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="titles">Titles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draft" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Draft from Title</CardTitle>
                <CardDescription>Generate a full article draft based on the current title.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={onDraftArticle} disabled={loadingStates.draft || !title} className="w-full">
                  {loadingStates.draft ? <Loader2 className="animate-spin" /> : 'Generate Draft'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adjust Style</CardTitle>
                <CardDescription>Refine the tone, length, and complexity of your article.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={styleTone} onValueChange={setStyleTone}>
                    <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="witty">Witty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                   <Select value={styleLength} onValueChange={setStyleLength}>
                    <SelectTrigger id="length"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same">Same</SelectItem>
                      <SelectItem value="shorter">Shorter</SelectItem>
                      <SelectItem value="longer">Longer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="complexity">Complexity</Label>
                   <Select value={styleComplexity} onValueChange={setStyleComplexity}>
                    <SelectTrigger id="complexity"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="same">Same</SelectItem>
                        <SelectItem value="simpler">Simpler</SelectItem>
                        <SelectItem value="more_complex">More Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => onAdjustStyle(styleTone, styleLength, styleComplexity)} disabled={loadingStates.style || !article} className="w-full">
                  {loadingStates.style ? <Loader2 className="animate-spin" /> : 'Adjust Style'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">SEO Optimizer</CardTitle>
                    <CardDescription>Enhance content for search engines based on keywords.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input id="keywords" placeholder="e.g., AI writing, content creation" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
                    </div>
                    {seoChecklist && (
                        <div className="space-y-2 rounded-md border border-dashed p-3 text-sm">
                            <h4 className="font-semibold">SEO Checklist Results:</h4>
                            <p><strong>Keyword Density:</strong> {seoChecklist.keywordDensity}</p>
                            <p><strong>Readability:</strong> {seoChecklist.readabilityScore}</p>
                            <p><strong>Advice:</strong> {seoChecklist.optimizationAdvice}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={() => onOptimizeSeo(seoKeywords)} disabled={loadingStates.seo || !article || !seoKeywords} className="w-full">
                      {loadingStates.seo ? <Loader2 className="animate-spin" /> : 'Optimize for SEO'}
                    </Button>
                </CardFooter>
             </Card>
          </TabsContent>

          <TabsContent value="titles" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Title Generation</CardTitle>
                    <CardDescription>Generate catchy titles from a topic or keywords.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic / Keywords</Label>
                        <Input id="topic" placeholder="e.g., The future of AI" value={titlesTopic} onChange={(e) => setTitlesTopic(e.target.value)} />
                    </div>
                    {suggestedTitles.length > 0 && (
                        <div className="space-y-2">
                            <Label>Suggestions</Label>
                            <div className="space-y-2">
                                {suggestedTitles.map((sTitle, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                                        <p className="flex-1">{sTitle}</p>
                                        <Button variant="ghost" size="sm" onClick={() => setTitle(sTitle)}>Use</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={() => onGenerateTitles(titlesTopic)} disabled={loadingStates.titles || !titlesTopic} className="w-full">
                        {loadingStates.titles ? <Loader2 className="animate-spin" /> : 'Generate Titles'}
                    </Button>
                </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
