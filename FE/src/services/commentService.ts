import type { AxiosProgressEvent } from "axios";

import { API } from "../constants";
import axiosInstance from "./_apiBase";


export const getComments = async (videoId: string) => {
  const res = await axiosInstance.get(API.videos.comments(videoId), {
    withCredentials: true,
  });
  return res.data;
};


export const postComment = async (
  videoId: string,
  content: string,
  parentId: number | null = null,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const res = await axiosInstance.post(
    API.videos.comments(videoId),
    {
      content,
      parent_comment_id: parentId,
    },
    {
      withCredentials: true,
      onUploadProgress,
    }
  );
  return res.data;
};