import React from 'react';

interface PostListSkeletonProps {
  columns: number;
  count?: number;
}

const PostListSkeleton: React.FC<PostListSkeletonProps> = ({ columns, count = 8 }) => {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 animate-pulse">
          <div className="bg-slate-200 rounded-lg aspect-video w-full mb-4"></div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-200 rounded-full h-10 w-10 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostListSkeleton;