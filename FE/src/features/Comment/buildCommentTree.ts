import type { CommentItem } from "./comments.dummy";

export interface CommentNode extends CommentItem {
  children: CommentNode[];
}

export const buildCommentTree = (
  comments: CommentItem[]
): CommentNode[] => {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach(c => {
    map.set(c.id, { ...c, children: [] });
  });

  comments.forEach(c => {
    const node = map.get(c.id)!;

    if (c.parentId === null) {
      roots.push(node);
    } else {
      map.get(c.parentId)?.children.push(node);
    }
  });

  return roots;
};
