import { Button, Result, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Comments } from '../../components/Comment';
import PostDetail from '../../components/PostDetail';
import useAuth from '../../hooks/useAuth';
import { getPostById } from '../../services/postService';
import type { IPost } from '../../types';

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      const data = await getPostById(id);
      setPost(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load post data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="Loading post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Result
          status="404"
          title="Post Not Found"
          subTitle={error || "Sorry, the page you visited does not exist."}
          extra={<Button type="primary" href="/">Back Home</Button>}
        />
      </div>
    );
  }

  const isOwner = Number(user?.id) === post.user.id;

  return <div className={`flex flex-col gap-2 w-full ${post.viewMode === "single" ? "max-w-250" : ""} mx-auto`}>
    <div className="">
      <PostDetail post={post} isOwner={isOwner} />
    </div>
    {user?.role !== "ADMIN" && <div className="space-y-10">
      <Comments postId={post.id.toString()} isAuthenticated={isAuthenticated} />
    </div>}
  </div>;
};