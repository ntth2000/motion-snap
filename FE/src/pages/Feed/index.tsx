import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorState from '../../components/Error';
import { getPosts } from '../../services/postService';
import type { IPost } from '../../types';
import { eventEmitter } from '../../utils/eventEmitter';

const VIDEOS_PER_PAGE_OPTIONS = [2, 3, 4];
const PostList = lazy(() => import('../../components/PostList'));
const PostListSkeleton = lazy(() => import('../../components/PostList/Skeleton'));

export default function Feed() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [columns, setColumns] = useState<number>(() => {
    const savedColumns = localStorage.getItem('feed_columns');
    return savedColumns ? parseInt(savedColumns, 10) : 4;
  });
  const [isError, setIsError] = useState<boolean>(false);
  const [maxAllowedColumns, setMaxAllowedColumns] = useState<number>(6);

  const fetchPosts = async () => {
    setIsError(false);
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    localStorage.setItem('feed_columns', columns.toString());
  }, [columns]);

  useEffect(() => {
    eventEmitter.on("reload-post-list", fetchPosts)

    return () => {
      eventEmitter.off("reload-post-list", fetchPosts)
    }
  }, [])


  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setMaxAllowedColumns(1);
      } else if (width < 768) {
        setMaxAllowedColumns(2);
      } else if (width < 1024) {
        setMaxAllowedColumns(3);
      } else {
        setMaxAllowedColumns(4);
      }
    };

    // Chạy ngay lần đầu và lắng nghe resize
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="w-full py-4 max-w-250 mx-auto">
      <div className="mb-12 flex flex-col justify-between items-center gap-6 sm:flex-row sm:items-end border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-extralight tracking-tight text-slate-900 dark:text-white">
            {t('pages.feed.title')}
          </h1>
          <p className="mt-2 text-slate-500 font-light">
            {t('pages.feed.description')}
          </p>
        </div>

        {maxAllowedColumns >= 2 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mr-3">{t('pages.feed.column')}</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {VIDEOS_PER_PAGE_OPTIONS.map((value) => (
                value <= maxAllowedColumns && (
                  <button
                    key={value}
                    onClick={() => setColumns(value)}
                    className={`cursor-pointer h-7 w-8 rounded text-xs transition-all duration-300 ${columns === value
                      ? 'bg-slate-900 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {value}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {isError ?
        <ErrorState onRetry={fetchPosts} /> : <Suspense fallback={<PostListSkeleton columns={columns} />}>
          <PostList posts={posts} columns={columns} />
        </Suspense>}
    </div>
  );
}
