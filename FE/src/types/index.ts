interface IVideo {
  key: React.Key;
  id: number;
  video: string;
  createdAt: string;
  status: string;
  thumbnailUrl: string;
  fileUrl: string;
  stage: string;
  jobId: number;
}

interface IComment {
  id: number;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  likeCount?: number;
  liked: boolean;
}

interface IUser {
  id: number;
  username: string;
  name: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  avatarUrl?: string;
}

interface IPost {
  id: number;
  caption?: string;
  resultMeshUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  viewMode: string;
  videos?: IVideo[];
  liked?: boolean;
  likeCount?: number;
  user: IUser;
}

export type { IComment, IPost, IUser, IVideo };