
import { Modal } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getAssetUrl } from '../../services/postService';
import type { IPost } from '../../types';
import OwnerView from './OwnerView';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';


interface PostDetailProps {
  post: IPost;
  isOwner: boolean;
}

const VIEWS = [{
  key: 'originalVideo',
}, {
  key: 'extractedPoses',
}, {
  key: 'draw3d'
}];

export default function PostDetail({ post, isOwner }: PostDetailProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'originalVideo' | 'extractedPoses' | 'draw3d'>('originalVideo');
  const [postDetail, setPostDetail] = useState<IPost>(post);
  const [isModalOpen, setIsOpenModal] = useState<boolean>(false);

  const viewOptions = useMemo(() => {
    return VIEWS.map((item) => ({
      label: t(`pages.post.viewOptions.${item.key}`),
      value: item.key,
    }));
  }, []);

  const onCancel = () => {
    setIsOpenModal(false);
  }
  return (
    <>
      <Modal
        open={isModalOpen}
        onCancel={onCancel}
        title={"Chỉnh sửa"}
        width={1200}
        centered
        maskClosable={false}
        styles={{
          body:
          {
            padding: '24px 24px 0 24px',
            maxHeight: '80vh',
            overflowY: 'scroll'
          }
        }}
      >
        <OwnerView post={post} />
      </Modal>
      <div className="flex flex-col gap-8">
        <div className='flex flex-row gap-4 w-full'>
          {
            postDetail?.videos?.map((video, index) => (
              <div className='flex-1' key={index}>
                <PostMedia
                  videoUrl={video.fileUrl ? getAssetUrl(video.fileUrl) : ""}
                  viewOptions={viewOptions}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            ))
          }
        </div>
        <div className="rounded-xl bg-white shadow-sm w-full">
          <PostHeader postDetail={postDetail} isOwner={isOwner} viewMode={viewMode} />
        </div>
      </div >
    </>
  );
};
