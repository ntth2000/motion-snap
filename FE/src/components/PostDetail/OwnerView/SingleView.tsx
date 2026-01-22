import { Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { getAssetUrl } from '../../../services/postService';
import type { IPost } from '../../../types';

const { Text } = Typography;

interface SingleViewProps {
    post: IPost;
}

const SingleView: React.FC<SingleViewProps> = ({ post }) => {
    const [videoUrl, setVideoUrl] = useState<string | undefined>(post?.videos?.[0].fileUrl);
    useEffect(() => {
        setVideoUrl(post?.videos?.[0].fileUrl);
    }, [post]);
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="relative w-full aspect-video bg-black">
                <video
                    controls
                    className="w-full h-full object-contain"
                    src={videoUrl ? getAssetUrl(videoUrl) : undefined}
                    poster={getAssetUrl(post.thumbnailUrl)}
                />
            </div>

            <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-green-500"></span>
                    <Text type="secondary" strong>Ready for processing</Text>
                </div>
            </div>
        </div>
    );
};

export default SingleView;
