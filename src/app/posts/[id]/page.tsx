import { getAllPostIds, getPostData } from '@/lib/posts';
import PostClient from '@/components/PostClient';

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postData = await getPostData(id);
  return <PostClient post={postData} />;
}
