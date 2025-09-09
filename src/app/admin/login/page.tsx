"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // If auth is done loading and the user is an admin, redirect them.
    if (!loading && user && userProfile?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login({ email, password });
      // The useEffect will handle the redirect on successful login/auth state change
      toast({ title: "Login successful!" });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // While the auth state is loading, show a spinner.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If a user is logged in, but not an admin, show an unauthorized message.
  if (user && userProfile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-headline">Unauthorized</CardTitle>
                  <CardDescription>You do not have permission to access the admin panel.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                    <Button onClick={() => router.push('/')}>Go to Homepage</Button>
              </CardContent>
          </Card>
      </div>
    );
  }

  // If loading is finished and there's no user, show the login form.
  // This also covers the case where a non-admin user has logged out.
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Admin Login</CardTitle>
            <CardDescription>Sign in to the AurumAI Admin Panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Fallback for the case where user is admin but redirection hasn't happened yet.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
