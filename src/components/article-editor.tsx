
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronDown } from 'lucide-react';

type ArticleEditorProps = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  article: string;
  setArticle: Dispatch<SetStateAction<string>>;
};

export function ArticleEditor({ title, setTitle, article, setArticle }: ArticleEditorProps) {
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
            <Button variant="outline">Save Draft</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        Publish <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Publish to Medium</DropdownMenuItem>
                    <DropdownMenuItem>Publish to Dev.to</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
