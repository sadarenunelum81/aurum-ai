
import { BlogIndexPage } from '@/components/blog-index-page';
import { getPageConfigAction } from '@/app/actions';

export default async function AllPostsPage() {
  const result = await getPageConfigAction('blog');
  const config = result.success ? result.data : null;

  return <BlogIndexPage config={config} />;
}
