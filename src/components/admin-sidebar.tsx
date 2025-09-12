
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Home, Users, Settings, Bot, FileText, MessageSquare, Palette, FolderKanban, LayoutTemplate, File, FilePlus2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';


export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7 text-primary" />
          <h1 className="text-xl font-headline font-bold text-primary">AurumAI Admin</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/admin'}>
              <Link href="/admin">
                <Home />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/posts')}>
              <Link href="/admin/posts">
                <FileText />
                Posts
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton>
                <File />
                <span>Main Pages Setup</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/pages/about')}>
                    <Link href="/admin/pages?tab=about">About</Link>
                </SidebarMenuSubButton>
                 <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/pages/contact')}>
                    <Link href="/admin/pages?tab=contact">Contact</Link>
                </SidebarMenuSubButton>
                 <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/pages/privacy')}>
                    <Link href="/admin/pages?tab=privacy">Privacy</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSub>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/custom-pages')}>
                <Link href="/admin/custom-pages">
                  <FilePlus2 />
                  Custom Pages
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/categories-setup')}>
              <Link href="/admin/categories-setup">
                <FolderKanban />
                Categories
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/comments')}>
              <Link href="/admin/comments">
                <MessageSquare />
                Comments
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/admin/users'}>
              <Link href="/admin/users">
                <Users />
                User Management
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/auto-blogger-setup')}>
              <Link href="/admin/auto-blogger-setup">
                <Bot />
                Auto Blogger
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/general-settings')}>
              <Link href="/admin/general-settings">
                <Palette />
                General Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/template-setup')}>
              <Link href="/admin/template-setup">
                <LayoutTemplate />
                Template Setup
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/auto-blogger-setup')}>
                <Link href="/admin/auto-blogger-setup">
                    <Settings />
                    Settings
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
