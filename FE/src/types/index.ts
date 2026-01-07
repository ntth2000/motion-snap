interface IVideo {
    key: React.Key;
    id: number;
    video: string;
    title: string;
    description: string;
    createdAt: string;
    status: string;
    thumbnailUrl: string;
    videoUrl?: string;
}

interface IComment {
    id: number;
    videoId: number;
    parentId: number | null;
    content: string;
    depth: number;
    createdAt: string;
    updatedAt: string;
}

export type { IVideo, IComment };