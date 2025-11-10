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

export type { IVideo };