import type { AxiosProgressEvent } from "axios";

import { API } from "../constants";
import axiosInstance from "./_apiBase";


export const getComments = async (postId: string) => {
  const res = await axiosInstance.get(API.posts.comments(postId), {
    withCredentials: true,
  });
  return res.data;
};


export const postComment = async (
  postId: string,
  content: string,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const res = await axiosInstance.post(
    API.posts.comments(postId),
    {
      content,
    },
    {
      withCredentials: true,
      onUploadProgress,
    }
  );
  return res.data;
};


export const updateComment = async (id: number | string, content: string) => {
  const res = await axiosInstance.put(
    API.comments.byId(id), {
    content
  }, {
    withCredentials: true
  })
  return res;
}


export const deleteComment = async (id: number | string) => {
  const res = await axiosInstance.delete(
    API.comments.byId(id), {
    withCredentials: true
  })
  return res;
}


export const toggleLikeComment = async (id: number | string) => {
  const res = await axiosInstance.post(
    API.comments.like(id), {
    withCredentials: true
  })
  return res.data;
}