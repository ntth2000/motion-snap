import type { AxiosProgressEvent } from "axios";

import { API } from "../constants";
import axiosInstance from "./_apiBase";


export const getUsers = async () => {
	const res = await axiosInstance.get(API.users.all, {
		withCredentials: true,
	});
	return res.data;
};

export const getUserById = async (userId: number | string) => {
	const res = await axiosInstance.get(API.users.byId(userId), {
		withCredentials: true
	})
	return res.data;
}

export const getUserByUsername = async (username: string) => {
  const res = await axiosInstance.get(API.users.byUsername(username), {
    withCredentials: true
  })
  return res.data;
}


export const postComment = async (
	postId: string,
	content: string,
	parentId: number | null = null,
	onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
	const res = await axiosInstance.post(
		API.posts.comments(postId),
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