import { VideoCameraOutlined } from '@ant-design/icons';
import { Card, Space, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import type { IPost } from '../../types';
import { formatRelativeTime } from '../../utils/util';
import AvatarUI from '../UI/Avatar';
import { getAssetUrl } from '../../services';

const { Text, Title } = Typography;

interface PostItemProps {
  post: IPost;
  isDisplayOwner?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ post, isDisplayOwner = true }) => {
  return (
    <Link to={`/posts/${post.id}`}>
      <Card
        hoverable
        cover={
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {post?.thumbnailUrl?.trim() !== '' ? (
              <img
                alt={post.caption}
                src={getAssetUrl(post.thumbnailUrl)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                <VideoCameraOutlined style={{ fontSize: '32px' }} />
              </div>
            )}
          </div>
        }
        styles={{ body: { padding: '12px' } }}
        className="overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Title level={5} ellipsis={{ rows: 1 }} className='m-0! line-clamp-1'>
            {post.caption || 'Untitled Motion'}
          </Title>

          <div className="flex flex-row gap-2">
            {isDisplayOwner && <div className="flex flex-row items-center">
              <AvatarUI name={post.user.name} />
            </div>}
            <div>
              {isDisplayOwner && <Text type="secondary" className="line-clamp-1 text-sm">
                {post.user.name || 'Unknown User'}
              </Text>}
              <Text type="secondary" className='text-xs!'>
                {formatRelativeTime(post.createdAt)}
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    </Link>
  );
};

export default PostItem;
