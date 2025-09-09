
"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ArticleEditor } from '@/components/article-editor';
import { AIToolsPanel } from '@/components/ai-tools-panel';
import type { OptimizeContentForSEOOutput } from '@/ai/flows/optimize-content-for-seo';
import { 
  generateTitlesAction, 
  draftArticleAction, 
  adjustStyleAction, 
  optimizeSeoAction 
} from '@/app/actions';

export function Dashboard() {
  const { toast } = useToast();
  const [title, setTitle] = useState("The Unseen Power of Automated Content Creation");
  const [article, setArticle] = useState(
    "In a world driven by digital information, the demand for high-quality content is insatiable. From blog posts to marketing copy, businesses and individuals alike are constantly seeking ways to produce engaging material efficiently. This is where the unseen power of automated content creation comes into play, revolutionizing how we think about writing and publishing.\n\nAt its core, automated content creation leverages artificial intelligence to generate written material. But it's more than just a robot typing words. Modern AI tools can understand context, adopt specific tones, and even optimize content for search engines. This capability allows creators to overcome writer's block, scale their output, and focus on higher-level strategy rather than the nuts and bolts of sentence construction.\n\nImagine drafting an entire article from a single title, or instantly transforming a casual blog post into a formal report. This is the reality that AI-powered platforms like AurumAI are bringing to the forefront. The efficiency gains are immense, but the true power lies in the creative partnership between human and machine. By handling the heavy lifting, AI frees up writers to do what they do best: innovate, strategize, and connect with their audience on a deeper level."
  );
  
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [seoChecklist, setSeoChecklist] = useState<OptimizeContentForSEOOutput['seoChecklist'] | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    draft: false,
    style: false,
    seo: false,
    titles: false,
  });

  const handleAction = async <T>(action: Promise<{success: boolean; data?: T; error?: string}>, loadingKey: keyof typeof loadingStates, onSuccess: (data: T) => void) => {
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const result = await action;
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: result.error,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: "Please check the console for more details.",
      });
      console.error(e);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleGenerateTitles = async (topic: string) => {
    await handleAction(generateTitlesAction({ topic }), 'titles', (data) => {
      setSuggestedTitles(data.titles);
    });
  };

  const handleDraftArticle = async () => {
    await handleAction(draftArticleAction({ title }), 'draft', (data) => {
      setArticle(data.draft);
      toast({ title: "Article draft generated successfully!" });
    });
  };

  const handleAdjustStyle = async (tone: string, length: string, complexity: string) => {
    await handleAction(adjustStyleAction({ article, tone, length, complexity }), 'style', (data) => {
      setArticle(data.adjustedArticle);
      toast({ title: "Article style adjusted." });
    });
  };
  
  const handleOptimizeSeo = async (keywords: string) => {
    await handleAction(optimizeSeoAction({ content: article, keywords }), 'seo', (data) => {
      setArticle(data.optimizedContent);
      setSeoChecklist(data.seoChecklist);
      toast({ title: "Content optimized for SEO." });
    });
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 grid gap-8 lg:grid-cols-3 xl:grid-cols-5">
      <div className="lg:col-span-2 xl:col-span-3">
        <ArticleEditor 
          title={title} 
          setTitle={setTitle} 
          article={article} 
          setArticle={setArticle} 
        />
      </div>
      <div className="lg:col-span-1 xl:col-span-2">
        <AIToolsPanel
          title={title}
          article={article}
          suggestedTitles={suggestedTitles}
          seoChecklist={seoChecklist}
          onDraftArticle={handleDraftArticle}
          onAdjustStyle={handleAdjustStyle}
          onOptimizeSeo={handleOptimizeSeo}
          onGenerateTitles={handleGenerateTitles}
          setArticle={setArticle}
          setTitle={setTitle}
          loadingStates={loadingStates}
        />
      </div>
    </div>
  );
}
