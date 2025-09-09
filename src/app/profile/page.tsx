"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || !userProfile) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-lg p-8">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-5 w-1/2 mx-auto" />
                    </div>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-3xl font-headline">{user.email}</CardTitle>
                <CardDescription>Role: {userProfile.role}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Welcome to your profile page.</p>
           <Button variant="outline" className="mt-6" onClick={() => router.push('/')}>
            Back to Dashboard
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
