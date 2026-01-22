import { Card } from 'antd';
import { Typography } from 'antd';
import React from 'react';

import type { IPost } from '../../../types';

const { Text } = Typography;

interface MultiViewProps {
    post: IPost;
}
const MultiView: React.FC<MultiViewProps> = ({ post }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                    className="overflow-hidden border-gray-200 dark:border-gray-800"
                    bodyStyle={{ padding: 0 }}
                    title={
                        <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-sm">View 1: Main Cam</span>
                        </div>
                    }
                >
                    <div className="aspect-video bg-black relative flex items-center justify-center">
                        <div className="text-gray-500">
                            <video controls src={post?.videos?.[0].fileUrl} className="absolute inset-0" />
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                            <span className="inline-block size-2 rounded-full bg-green-500"></span>
                            <Text type="secondary">Ready for processing</Text>
                        </div>
                    </div>
                </Card>
                <Card
                    className="overflow-hidden border-gray-200 dark:border-gray-800"
                    bodyStyle={{ padding: 0 }}
                    title={
                        <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-sm">View 2: Side Cam</span>
                        </div>
                    }
                >
                    <div className="aspect-video bg-black relative flex items-center justify-center">
                        <div className="text-gray-500">
                            <video controls src={post?.videos?.[1].fileUrl} className="absolute inset-0" />
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                            <span className="inline-block size-2 rounded-full bg-green-500"></span>
                            <Text type="secondary">Ready for processing</Text>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MultiView;
