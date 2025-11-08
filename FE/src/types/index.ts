interface IVideo {
    key: React.Key;
    id: number;
    video: string;
    title: string;
    description: string;
    createdAt: string;
    status: string;
    thumbnailUrl: string;
}

export type { IVideo };