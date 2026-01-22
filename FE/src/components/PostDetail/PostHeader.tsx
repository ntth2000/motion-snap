import { DeleteOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, LikeOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, message, Modal, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { VIEW_MODE } from "../../constants";
import useAuth from "../../hooks/useAuth";
import { deletePost, getExportedData, toggleLikePost, updatePostCaption } from "../../services/postService";
import type { IPost } from "../../types";
import { formatDate, getFirstChar } from "../../utils/util";

interface PostHeaderProps {
  postDetail: IPost;
  isOwner: boolean;
  viewMode: string;
}

const { Paragraph } = Typography;

export default function PostHeader({ postDetail, isOwner, viewMode }: PostHeaderProps) {
  const { t } = useTranslation();
  const [modal, modalContextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const [messageApi, msgContextHolder] = message.useMessage();
  const [isEditingCaption, setIsEditingCaption] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [content, setContent] = useState<string>(postDetail?.caption || '');
  const [tempContent, setTempContent] = useState<string>(postDetail?.caption || '');
  const [likeStatus, setLikeStatus] = useState<{ liked: boolean, likeCount: number }>({
    likeCount: postDetail?.likeCount || 0,
    liked: postDetail?.liked || false
  })
  const { isAuthenticated } = useAuth();

  const handleUpdateCaption = async () => {
    if (!tempContent.trim()) return;
    setIsUpdating(true);
    try {
      await updatePostCaption(postDetail.id, tempContent);
      setContent(tempContent);
      setIsEditingCaption(false);
      messageApi.open({
        type: 'success',
        content: t('pages.post.message.update_success'),
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: t('pages.post.message.update_error'),
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleViewProfile = (username: string) => {
    navigate(`/profile/${username}`);
  }

  const handleDeletePost = (id: string | number) => {
    modal.confirm({
      title: t('pages.post.deleteConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      okText: "OK",
      cancelText: t("common.cancel"),
      onOk: async () => {
        try {
          await deletePost(id);
          navigate("/");
        } catch (error) {
          messageApi.open({
            type: 'error',
            content: t('pages.post.message.delete_error'),
          });
        }
      },
    });
  };

  const handleDownload = async () => {
    const type = viewMode === VIEW_MODE.EXTRACTED_POSES ? "extracted_poses" : "draw_3d"
    try {
      const response = await getExportedData(postDetail.id, type);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `post${postDetail.id}_${type}_export.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  const handleLikePost = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    };
    const res = await toggleLikePost(postDetail.id);
    setLikeStatus({
      liked: res.liked,
      likeCount: res.likeCount
    })
  }

  const handleCancelEditCaption = () => {
    setIsEditingCaption(false);
    setTempContent(content);
  }
  return <>
    {modalContextHolder}
    {msgContextHolder}
    <div className="px-8 py-2">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="mt-6 flex items-center gap-2">
          <div className="cursor-pointer" onClick={() => handleViewProfile(postDetail.user.username)}>
            <Avatar
              className="!bg-primary/10 !text-primary !font-bold border border-primary/20"
              size="large"
            >
              {getFirstChar(postDetail.user.name)}
            </Avatar>
          </div>
          <div>
            <span
              onClick={() => handleViewProfile(postDetail.user.username)}
              className="text-md font-medium cursor-pointer hover:text-primary dark:text-slate-200"
            >
              {postDetail.user.username}
            </span>
            <div className="text-sm text-secondary">
              <span>{formatDate(postDetail.createdAt)}</span>
            </div>
          </div>
        </div>
        {isOwner && <div>
          <div className="">
            <Button
              type="text"
              icon={<EditOutlined className="text-[20px]" />}
              onClick={() => {
                setTempContent(content);
                setIsEditingCaption(true);
              }}
              className='text-secondary! flex items-center gap-2 hover:text-primary!'
            >
              {t("pages.post.editBtn")}
            </Button>
            <Button
              variant="text"
              color="danger"
              icon={<DeleteOutlined className="text-[20px]" />}
              onClick={() => handleDeletePost(postDetail.id)}
            >
              {t("pages.post.deleteBtn")}
            </Button>
          </div>
        </div>}
      </div>
      {isEditingCaption ? <div>
        <TextArea
          autoSize={{ minRows: 3, maxRows: 3 }}
          className="w-full bg-transparent resize-none p-0 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:shadow-none"
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
        />
        <div className="flex gap-2 mt-3 mb-4">
          <Button className="text-xs!" type="primary" size='small' onClick={handleUpdateCaption} disabled={isUpdating}>
            {t("comment.updateBtn")}
          </Button>
          <Button className="text-xs!" color="default" variant="outlined" size='small' onClick={(handleCancelEditCaption)} disabled={isUpdating}>
            {t("comment.cancelBtn")}
          </Button>
        </div>
      </div> : <Paragraph className="max-w-none text-base leading-relaxed">
        {content}
      </Paragraph>
      }

      <Divider className="my-0! border-slate-50 dark:border-slate-800" />

      <div className="flex items-center gap-8 pt-2">
        <Button
          type="text"
          icon={<LikeOutlined className={`text-lg ${likeStatus.liked ? "text-primary" : ""}`} />}
          className={`flex items-center gap-2 hover:text-primary! ${likeStatus.liked ? "text-primary!" : "text-secondary!"}`}
          onClick={handleLikePost}
        >
          {likeStatus.likeCount || 0}
        </Button>
        {viewMode !== VIEW_MODE.ORIGINAL_VIDEO && <Button
          type="text"
          icon={<DownloadOutlined className="text-lg" />}
          className="text-secondary! flex items-center gap-2 hover:text-primary!"
          onClick={() => handleDownload()}
        >
          {t('pages.post.downloadBtn')}
        </Button>}
      </div>
    </div>
  </>
}