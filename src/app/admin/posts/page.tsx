
import { PostList } from '@/components/post-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPostsPage() {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Post Management</h1>
                    <p className="text-muted-foreground">
                        View, edit, and manage all your articles.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/posts/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>
            <PostList />
        </div>
    );
}
