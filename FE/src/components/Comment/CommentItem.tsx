// CommentItem.tsx
import { LikeOutlined } from "@ant-design/icons";
import { Button, message, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import useAuth from "../../hooks/useAuth";
import { toggleLikeComment, updateComment } from '../../services/commentService'
import type { IComment } from "../../types";
import { formatRelativeTime } from "../../utils/util";
import AvatarUI from "../UI/Avatar";

interface Props {
  comment: IComment;
  setIsReplying?: (isReplying: boolean) => void;
  isAuthenticated?: boolean;
  deleteComment: () => void;
}

const { Text } = Typography;

export const CommentItem = ({ comment, isAuthenticated = false, deleteComment }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [messageApi, msgContextHolder] = message.useMessage();
  const [isEditing, setIsEditting] = useState<boolean>(false);
  const [content, setContent] = useState<string>(comment.content);
  const [tempContent, setTempContent] = useState<string>(comment.content);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [likeStatus, setLikeStatus] = useState<{ liked: boolean, likeCount: number }>({
    likeCount: comment?.likeCount || 0,
    liked: comment?.liked || false
  })

  const isCommentOwner = user?.id.toString() === comment.userId.toString();

  const handleViewProfile = (username: string) => {
    navigate(`/profile/${username}`);
  }

  const handleEditComment = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setTempContent(content);
    setIsEditting(true);
  };

  const handleUpdateComment = async () => {
    if (!tempContent.trim()) return;
    setIsUpdating(true);
    try {
      await updateComment(comment.id, tempContent);
      setContent(tempContent);
      setIsEditting(false);
      messageApi.open({
        type: 'success',
        content: t('comment.message.update_success'),
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: t('comment.message.update_error'),
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleCancelComment = () => {
    setIsEditting(false);
    setTempContent(content);
  }

  const handleLikeComment = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    };
    const res = await toggleLikeComment(comment.id);
    setLikeStatus({
      liked: res.liked,
      likeCount: res.likeCount
    })
  }

  return (
    <>
      {msgContextHolder}
      <div className="flex gap-4">
        <div className="pt-2 cursor-pointer">
          <AvatarUI
            name={comment?.username || ""}
            onClick={() => handleViewProfile(comment.username)}
          />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Text strong
              className="text-slate-800 dark:text-slate-200 cursor-pointer"
              onClick={() => handleViewProfile(comment.username)}
            >
              {comment.username}
            </Text>
            <Text type="secondary" className="text-xs! font-light">{formatRelativeTime(comment.createdAt)}</Text>
          </div>
          {
            isEditing ?
              <div>
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 3 }}
                  className="w-full bg-transparent resize-none p-0 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:shadow-none"
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <Button className="text-xs!" type="primary" size='small' onClick={handleUpdateComment} disabled={isUpdating}>
                    {t("comment.updateBtn")}
                  </Button>
                  <Button className="text-xs!" color="default" variant="outlined" size='small' onClick={handleCancelComment} disabled={isUpdating}>
                    {t("comment.cancelBtn")}
                  </Button>
                </div>
              </div> : <>
                <p className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {content}
                </p>
                <div className="flex items-center gap-6 text-xs text-slate-400">
                  <div
                    className={`flex items-center gap-1.5 cursor-pointer hover:text-primary ${likeStatus.liked ? "text-primary" : ""}`}
                    onClick={handleLikeComment}
                  >
                    <LikeOutlined />
                    <span className="font-light">{likeStatus.likeCount || 0}</span>
                  </div>
                  {isAuthenticated && isCommentOwner &&
                    <button className="hover:text-primary cursor-pointer" onClick={handleEditComment}>
                      {t("comment.editBtn")}
                    </button>
                  }
                  {isAuthenticated && isCommentOwner &&
                    <button className="hover:text-primary text-red-500 cursor-pointer" onClick={deleteComment}>
                      {t("comment.deleteBtn")}
                    </button>}
                </div>
              </>
          }
        </div>
      </div>
    </>
  );
};

