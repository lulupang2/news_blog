import { getSortedPostsData } from '@/lib/posts';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  const posts = getSortedPostsData();

  return <HomeClient posts={posts} />;
}
