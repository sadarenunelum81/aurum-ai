
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';

type ArticleEditorProps = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  article: string;
  setArticle: Dispatch<SetStateAction<string>>;
  onSave: (status: 'draft' | 'published') => Promise<void>;
  isSaving: boolean;
};

export function ArticleEditor({ title, setTitle, article, setArticle, onSave, isSaving }: ArticleEditorProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="text-3xl font-headline border-0 shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
          placeholder="Your Masterpiece's Title"
        />
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 flex flex-col pt-6">
        <Textarea 
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base bg-transparent leading-relaxed"
          placeholder="Begin your story here... Use the AI Assistant on the right to draft, refine, and optimize your content."
        />
      </CardContent>
      <Separator />
      <CardFooter className="py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Theme:</span>
            <Select defaultValue="aurum-dark">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="aurum-dark">Aurum Dark</SelectItem>
                    <SelectItem value="coming-soon" disabled>More themes coming soon</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => onSave('draft')} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : 'Save Draft'}
            </Button>
            <Button onClick={() => onSave('published')} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : 'Publish'}
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
