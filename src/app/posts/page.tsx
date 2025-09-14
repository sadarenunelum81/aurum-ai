
import { BlogIndexPage } from "@/components/blog-index-page";

export default async function PostsPage() {
  // By passing no config, the BlogIndexPage will default to showing all published posts.
  return <BlogIndexPage config={null} />;
}
