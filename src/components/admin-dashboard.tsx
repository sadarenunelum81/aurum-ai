
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

export function AdminDashboard() {

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
                <CardDescription>This is the admin dashboard. You can manage users and content from here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>More features coming soon.</p>
            </CardContent>
        </Card>
    </div>
  );
}
