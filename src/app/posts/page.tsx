
import { BlogIndexPage } from "@/components/blog-index-page";
import { getPageConfig } from "@/lib/pages";

export default async function PostsPage() {
  const blogConfig = await getPageConfig('blog');
  return <BlogIndexPage config={blogConfig} />;
}
