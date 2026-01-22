// CommentList.tsx
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { message, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { deleteComment, getComments, postComment } from "../../services/commentService";
import type { IComment } from "../../types";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";

interface Props {
  postId: string;
  isAuthenticated?: boolean;
}

const { Text, Title } = Typography;

export const Comments = ({ postId, isAuthenticated }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messageApi, msgContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [comments, setComments] = useState<IComment[]>([]);

  const handleSubmitComment = async (content: string) => {
    await postComment(postId, content.trim());
    const res = await getComments(postId);
    setComments(res.comments);
  }

  useEffect(() => {
    const getCommentsByPostId = async (postId: string) => {
      const res = await getComments(postId);
      console.log("res", res);
      setComments(res.comments);
    }
    getCommentsByPostId(postId);
  }, [postId]);

  const handleDeleteComment = (id: string | number) => {
    console.log('delete comment')
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    modal.confirm({
      title: t('comment.deleteConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      okText: "OK",
      cancelText: t("comment.cancelBtn"),
      onOk: async () => {
        try {
          await deleteComment(id);
          setComments(prevComments => prevComments.filter(comment => comment.id !== id));
          messageApi.open({
            type: 'success',
            content: t('comment.message.delete_success'),
          });
        } catch (error) {
          messageApi.open({
            type: 'error',
            content: t('comment.message.delete_error'),
          });
        }
      },
    });
  };

  return <>
    {modalContextHolder}
    {msgContextHolder}
    <div className="mt-8 rounded-xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Title level={4} className="mb-8 flex items-center gap-2 !font-light text-slate-800 dark:text-slate-100">
        {t("comment.title")} <span className="text-base font-light text-slate-300">{comments.length || 0}</span>
      </Title>
      <div className="flex flex-col gap-10 mt-6">
        <CommentInput
          postId={postId}
          isAuthenticated={isAuthenticated}
          handleSubmitComment={handleSubmitComment}
          placeholder={t("comment.postCommentPlaceholder")}
        />
        <div className="flex flex-col gap-4">
          {comments.length > 0 ? comments.map(comment => (
            <div key={comment.id}>
              <CommentItem comment={comment} isAuthenticated={isAuthenticated} deleteComment={() => handleDeleteComment(comment.id)} />
            </div>
          )) : <div className="flex items-center justify-center">
            <Text type='secondary'>{t("comment.noComments")}</Text>
          </div>
          }
        </div>
      </div>
    </div>
  </>
};
