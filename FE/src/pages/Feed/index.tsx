import { AppstoreOutlined } from '@ant-design/icons';
import { Pagination, Radio } from 'antd';
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
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-3xl font-semibold">
          {t('pages.feed.title')}
        </h1>

        {maxAllowedColumns >= 2 && <div className="flex items-center rounded-lg bg-gray-100 p-1">
          <div className="flex h-8 items-center px-3 text-gray-500">
            <AppstoreOutlined className="text-xl" />
          </div>
          <Radio.Group
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="flex"
            disabled={posts.length === 0}
          >
            {VIDEOS_PER_PAGE_OPTIONS.map((value) => (
              value <= maxAllowedColumns && <Radio.Button key={value} value={value} className="!h-8 !leading-7">
                {value}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>}
      </div>

      {isError ?
        <ErrorState onRetry={fetchPosts} /> : <Suspense fallback={<PostListSkeleton columns={columns} />}>
          <PostList posts={posts} columns={columns} />
        </Suspense>}

      {posts.length > 0 && (
        <div className="mt-12 mb-8 flex justify-center">
          <Pagination
            defaultCurrent={1}
            total={posts.length}
            showSizeChanger={false}
            hideOnSinglePage={true}
          />
        </div>
      )}
    </div>
  );
}
