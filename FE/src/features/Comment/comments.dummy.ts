// comments.dummy.ts
export interface CommentItem {
  id: number;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  parentId: number | null;
  depth: 0 | 1;
  createdAt: string;
  isDeleted: boolean;
}


export const dummyComments: CommentItem[] = [
  // ===== Comment gốc =====
  {
    id: 1,
    userId: 1,
    username: "Huyen",
    content: "Video này hay ghê",
    parentId: null,
    depth: 0,
    createdAt: "2025-01-01T10:00:00",
    isDeleted: false,
  },

  // ===== Reply cho comment #1 =====
  {
    id: 2,
    userId: 2,
    username: "Minh",
    content: "Chuẩn luôn 👍",
    parentId: 1,
    depth: 1,
    createdAt: "2025-01-01T10:05:00",
    isDeleted: false,
  },

  // ===== Comment gốc thứ 2 =====
  {
    id: 3,
    userId: 3,
    username: "An",
    content: "Mình thấy đoạn cuối edit rất tốt",
    parentId: null,
    depth: 0,
    createdAt: "2025-01-02T09:00:00",
    isDeleted: false,
  },

  // ===== Reply cho comment #3 =====
  {
    id: 4,
    userId: 4,
    username: "Tuan",
    content: "Đúng rồi, xem cuốn thật",
    parentId: 3,
    depth: 1,
    createdAt: "2025-01-02T09:10:00",
    isDeleted: false,
  },
];
