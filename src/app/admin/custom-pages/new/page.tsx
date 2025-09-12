
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function NewCustomPage() {
    
    // This is the placeholder for the custom page builder.
    // In the next steps, we will build out the block editor here.

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Build Your Custom Page</CardTitle>
                    <CardDescription>Use the controls below to add and configure content blocks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-24 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Page Builder Coming Soon</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Save Page
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
