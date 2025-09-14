
import { BlogIndexPage } from '@/components/blog-index-page';

// This page is intentionally simple. It uses the BlogIndexPage component
// without any specific configuration, which makes the component default
// to showing all published posts with client-side filtering.

export default function AllPostsPage() {
  return <BlogIndexPage config={null} />;
}
