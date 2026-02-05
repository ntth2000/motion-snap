import { Button, Result, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Comments } from '../../components/Comment';
import useAuth from '../../hooks/useAuth';
import { getPostById } from '../../services/postService';
import type { IPost } from '../../types';
import PostMedia from './PostMedia';
import PostHeader from './PostHeader';

export default function PostPage() {
  const { t } = useTranslation();
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
      setError(t('pages.post.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip={t('pages.post.loading')} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Result
          status="404"
          title={t('pages.post.notFound')}
          subTitle={error || t('pages.post.notFoundDesc')}
          extra={<Button type="primary" href="/">{t('pages.post.backHome')}</Button>}
        />
      </div>
    );
  }

  const isOwner = Number(user?.id) === post.user.id;

  return <div className={`flex flex-col gap-2 w-full ${post.viewMode === "single" ? "max-w-250" : ""} mx-auto`}>
    <div className="">
      <div className="flex flex-col gap-8">
        <div className='flex flex-row gap-4 w-full'>
          {
            post?.videos?.map((video, index) => (
              <div className='flex-1' key={index}>
                <PostMedia
                  video={video}
                  isOwner={isOwner}
                />
              </div>
            ))
          }
        </div>
        <div className="rounded-xl bg-white shadow-sm w-full">
          <PostHeader postDetail={post} isOwner={isOwner} />
        </div>
      </div >
    </div>
    {user?.role !== "ADMIN" && <div className="space-y-10">
      <Comments postId={post.id.toString()} isAuthenticated={isAuthenticated} />
    </div>}
  </div>;
};