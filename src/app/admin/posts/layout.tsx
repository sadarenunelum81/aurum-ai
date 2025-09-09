
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AuthButton } from '@/components/auth-button';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminPostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                  <SidebarTrigger className="lg:hidden" />
                  <h2 className="text-lg font-headline font-semibold">Post Management</h2>
              </div>
              <div className="flex items-center gap-4">
                <AuthButton />
              </div>
          </header>
          {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
