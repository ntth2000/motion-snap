// CommentList.tsx
import { dummyComments, type CommentItem as CommentItemType } from "./comments.dummy";
import { buildCommentTree } from "./buildCommentTree";
import { useEffect, useMemo, useState } from "react";
import ReplyToComment from "./ReplyComment";
import { CommentItem } from "./CommentItem";
import { getComments } from "../../services/commentService";

interface Props {
  videoId: string;
}


export const CommentList = ({ videoId }: Props) => {
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const commentTree = useMemo(
    () => buildCommentTree(comments),
    [comments]
  );
  console.log("commentTree", commentTree);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  useEffect(() => {
    const getCommentsByVideoId = async (videoId: string) => {
      const res = await getComments(videoId);
      console.log("res", res);
      setComments(res.comments);
    }
    getCommentsByVideoId(videoId);
  }, [videoId]);

  return commentTree.map(parent => (
    <div key={parent.id}>
      <CommentItem comment={parent} setIsReplying={setIsReplying} />

      <div style={{ marginLeft: 40, marginTop: 8 }}>
        {parent.children.map(child => (
          <CommentItem key={child.id} comment={child} />
        ))}
      </div>

      {isReplying && <ReplyToComment />}
    </div>
  ));
};
