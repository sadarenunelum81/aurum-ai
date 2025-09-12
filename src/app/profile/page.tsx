
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { updateUserProfile } from '@/lib/auth';
import { uploadImageAction } from '@/app/actions';
import { getAutoBloggerConfig } from '@/lib/config';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    address: '',
    profilePictureUrl: '',
  });

  const [styleConfig, setStyleConfig] = useState({
      textColor: '',
      overlayColor: '',
      backgroundImage: '',
  });

  useEffect(() => {
    async function loadStyling() {
        const config = await getAutoBloggerConfig();
        if (config) {
            setStyleConfig({
                textColor: (config as any).profilePageTextColor || '',
                overlayColor: (config as any).profilePageOverlayColor || '',
                backgroundImage: (config as any).profilePageBgImage || '',
            });
        }
    }
    loadStyling();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (userProfile) {
        setFormData({
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            country: userProfile.country || '',
            city: userProfile.city || '',
            address: userProfile.address || '',
            profilePictureUrl: userProfile.profilePictureUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${user?.uid}`,
        });
    }
  }, [user, userProfile, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
          const imageDataUri = reader.result as string;
          const result = await uploadImageAction({ imageDataUri });
          if (result.success) {
              setFormData(prev => ({ ...prev, profilePictureUrl: result.data.imageUrl }));
              toast({ title: 'Success', description: 'Profile picture updated. Save changes to confirm.' });
          } else {
              throw new Error(result.error);
          }
      };
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        await updateUserProfile(user.uid, formData);
        await refreshUserProfile();
        toast({ title: 'Success', description: 'Your profile has been updated.' });
        setIsEditing(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
    } finally {
        setIsSaving(false);
    }
  };


  if (loading || !user || !userProfile) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-2xl p-8">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto" />
                    </div>
                </div>
            </Card>
        </div>
    );
  }
  
  const accountCreatedDate = userProfile.createdAt ? format(new Date(userProfile.createdAt.seconds * 1000), 'PPP') : 'N/A';
  
  const containerStyle: React.CSSProperties = {
      backgroundImage: styleConfig.backgroundImage ? `url(${styleConfig.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
  };

  const overlayStyle: React.CSSProperties = {
      backgroundColor: styleConfig.overlayColor || 'rgba(0,0,0,0.5)',
  };

  const textStyle = {
      color: styleConfig.textColor || (resolvedTheme === 'dark' ? 'white' : 'black'),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" style={containerStyle}>
      <div className="absolute inset-0 z-0" style={overlayStyle}></div>
      <Card className="w-full max-w-2xl shadow-2xl z-10 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col items-center gap-6">
             <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={formData.profilePictureUrl} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                         <label htmlFor="profile-picture-upload" className="cursor-pointer">
                            <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </div>
                         </label>
                        <input id="profile-picture-upload" type="file" accept="image/*" className="sr-only" onChange={handleProfilePictureUpload} disabled={isUploading}/>
                    </div>
                )}
             </div>
            <div style={textStyle}>
                <CardTitle className="text-3xl font-headline text-center">{user.email}</CardTitle>
                <CardDescription className="text-center mt-1" style={{ color: styleConfig.textColor ? `color-mix(in srgb, ${styleConfig.textColor} 70%, transparent)`: undefined }}>
                    Role: {userProfile.role} | Member since: {accountCreatedDate}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-6 space-y-6" style={textStyle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditing || isSaving} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!isEditing || isSaving} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={formData.country} onChange={handleInputChange} disabled={!isEditing || isSaving} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} disabled={!isEditing || isSaving} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing || isSaving} />
                </div>
            </div>
            {/* Placeholder for stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Posts Read (24h)</p>
                    <p className="text-2xl font-bold">0</p>
                </div>
                 <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Posts Read</p>
                    <p className="text-2xl font-bold">0</p>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
            {isEditing ? (
                <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2"/>}
                        Save Changes
                    </Button>
                </>
            ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
