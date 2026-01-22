import React from 'react';

import type { IPost } from '../../types';
import PostItem from './PostItem';

interface PostListProps {
    posts: IPost[];
    columns: number;
}

const PostList: React.FC<PostListProps> = ({ posts, columns }) => {
    const gridClass = {
        2: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
    }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={`grid ${gridClass} gap-6`}>
            {posts.map((post) => (
                <PostItem key={post.id} post={post} />
            ))}
        </div>
    );
};

export default PostList;