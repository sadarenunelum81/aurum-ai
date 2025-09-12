"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getPageConfigAction } from '@/app/actions';
import type { PageConfig } from '@/types';
import { useTheme } from 'next-themes';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [styleConfig, setStyleConfig] = useState<PageConfig | null>(null);

  useEffect(() => {
    async function loadStyling() {
        const result = await getPageConfigAction('login');
        if (result.success && result.data) {
            setStyleConfig(result.data);
        }
    }
    loadStyling();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast({ title: "Login successful!" });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
      setLoading(false);
    }
  };

  const themeColors = resolvedTheme === 'dark' ? styleConfig?.darkTheme : styleConfig?.lightTheme;

  const containerStyle: React.CSSProperties = {
      backgroundImage: styleConfig?.backgroundImage ? `url(${styleConfig.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
  };

  const overlayStyle: React.CSSProperties = {
      backgroundColor: themeColors?.overlayColor || 'transparent',
  };
  
  const cardStyle: React.CSSProperties = {
       backgroundColor: themeColors?.backgroundColor || undefined
  }

  const titleStyle = { color: themeColors?.titleColor || undefined };
  const textStyle = { color: themeColors?.textColor || undefined };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" style={containerStyle}>
      <div className="absolute inset-0 z-0" style={overlayStyle}></div>
      <Card className="w-full max-w-md shadow-2xl z-10" style={cardStyle}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline" style={titleStyle}>Welcome Back</CardTitle>
          <CardDescription style={textStyle}>Sign in to your AurumAI account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" style={textStyle}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={textStyle}>Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm" style={textStyle}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
