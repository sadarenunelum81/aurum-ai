
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Home as HomeIcon, Settings, Share2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Dashboard } from '@/components/dashboard';
import { AuthButton } from '@/components/auth-button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="size-7 text-primary" />
            <h1 className="text-xl font-headline font-bold text-primary">AurumAI</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <HomeIcon />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FileText />
                Articles
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Share2 />
                Publishing
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Bot />
                AI Tools
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6 sticky top-0 z-10">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex-1">
                  <h2 className="text-lg font-headline font-semibold">Content Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                <Button asChild>
                  <Link href="/">New Article</Link>
                </Button>
                <AuthButton />
              </div>
          </header>
          <Dashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
