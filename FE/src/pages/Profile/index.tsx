import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import PostItem from "../../components/PostList/PostItem";
import { getPosts } from "../../services/postService";
import { getUserByUsername } from "../../services/userService";
import { type IPost, type IUser } from "../../types";
import { Avatar } from "antd";
import { getFirstChar } from "../../utils/util";

export default function UserProfile() {
  const { t } = useTranslation();
  const { username: profileOwner } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState<IUser>();
  const [posts, setPosts] = useState<IPost[]>([]);

  useEffect(() => {
    if (!profileOwner || profileOwner.toLowerCase() === "admin") {
      navigate('/');
      return;
    };
    const getUserInfo = async (username: string) => {
      try {
        const res = await getUserByUsername(username);
        setUserDetail(res)
      } catch (error) {
        navigate("/");
      }
    }
    const getUserPosts = async (username: number | string) => {
      const res = await getPosts(`username=${username}`);
      setPosts(res)
    }

    if (profileOwner) {
      getUserInfo(profileOwner);
      getUserPosts(profileOwner)
    }
  }, [profileOwner])

  return <main className="max-w-250 mx-auto pb-20">
    <section className="flex flex-col items-center pt-12 px-4">
      <div className="relative">
        <Avatar
          className="!bg-primary/10 !text-primary !font-bold border border-primary/20 w-20! h-20!"
        >
          {userDetail?.avatar ?
            <img src={userDetail?.avatar} alt="avatar" className="w-full h-full object-cover" />
            : getFirstChar(userDetail?.name || "")
          }
        </Avatar>
      </div>
      <div className="mt-6 flex flex-col items-center gap-1">
        <h2 className="text-[#0d121b] dark:text-white text-3xl font-semibold leading-tight tracking-tight">{userDetail?.name}</h2>
        <p className="text-primary text-md font-light">@{userDetail?.username}</p>
      </div>
    </section>
    {posts.length > 0 &&
      <section className="mt-12 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map(post => <PostItem isDisplayOwner={false} post={post} />)}
      </section>
    }
    {posts.length === 0 && <section className="mt-20">
      <p className="text-gray-500 text-center">
        {t("pages.profile.noPosts")}
      </p>
    </section>}
  </main>
}