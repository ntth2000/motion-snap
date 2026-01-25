
import useAuth from '../../hooks/useAuth';
import type { IPost } from '../../types';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';


interface PostDetailProps {
  post: IPost;
  isOwner: boolean;
}

export default function PostDetail({ post, isOwner }: PostDetailProps) {
  const { user } = useAuth();

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className='flex flex-row gap-4 w-full'>
          {
            post?.videos?.map((video, index) => (
              <div className='flex-1' key={index}>
                <PostMedia
                  video={video}
                  isOwner={user?.id === post.user.id}
                />
              </div>
            ))
          }
        </div>
        <div className="rounded-xl bg-white shadow-sm w-full">
          <PostHeader postDetail={post} isOwner={isOwner} />
        </div>
      </div >
    </>
  );
};
