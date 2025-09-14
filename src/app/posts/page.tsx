
import { BlogIndexPage } from "@/components/blog-index-page";
import { getPageConfigAction } from "@/app/actions";

export default async function PostsPage() {
  const configResult = await getPageConfigAction('blog');
  const config = configResult.success ? configResult.data : null;
  return <BlogIndexPage config={config} />;
}
