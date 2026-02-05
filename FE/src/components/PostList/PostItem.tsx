import { HeartOutlined, VideoCameraOutlined } from '@ant-design/icons';
import React from 'react';
import { Link } from 'react-router-dom';

import type { IPost } from '../../types';
import { formatRelativeTime } from '../../utils/util';
import AvatarUI from '../UI/Avatar';
import { getAssetUrl } from '../../services';

interface PostItemProps {
  post: IPost;
  isDisplayOwner?: boolean;
  showLikes?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ post, isDisplayOwner = true, showLikes = true }) => {
  return (
    <Link to={`/posts/${post.id}`} className="group block">
      <div className="flex flex-col gap-3 p-2 rounded-2xl bg-white border border-slate-100 transition-colors duration-200 border-slate-200 hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          {post?.thumbnailUrl?.trim() !== '' ? (
            <img
              alt={post.caption}
              src={getAssetUrl(post.thumbnailUrl)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <VideoCameraOutlined style={{ fontSize: '32px' }} />
            </div>
          )}

          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="flex flex-col px-1 pb-1">
          <div className="w-full flex flex-row justify-between">
            <h3 className="flex-1 text-sm font-normal text-slate-800 line-clamp-1">
              {post.caption || 'Untitled Motion'}
            </h3>
            {showLikes && (
              <div className="flex items-center gap-1">
                <HeartOutlined className="text-xs text-red-400" />
                <span className="text-xs text-slate-500">
                  {post.likeCount || 0}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            {isDisplayOwner && (
              <div className="flex items-center gap-2">
                <div className="rounded-full overflow-hidden bg-slate-100">
                  <AvatarUI name={post.user.name} avatarUrl={post.user.avatar} />
                </div>
                <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">
                  {post.user.name || 'Unknown User'}
                </span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 font-medium">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostItem;
