
import { BlogIndexPage } from '@/components/blog-index-page';
import { getPageConfigAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function AllPostsPage() {
  const result = await getPageConfigAction('blog');
  const config = result.success ? result.data : null;

  return <BlogIndexPage config={config} />;
}
