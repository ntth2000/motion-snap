import { API } from "../constants";
import axiosInstance from "./_apiBase";

export const createPostApi = (formData: FormData, onProgress?: (progressEvent: any) => void) => {
  return axiosInstance.post(API.posts.create, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress,
  });
};

export const getPosts = async (query?: string) => {
  try {
    const response = await axiosInstance.get(API.posts.list(query), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get posts: ", error);
    throw error;
  }
}

export const getPostById = async (postId: string | number) => {
  try {
    const response = await axiosInstance.get(`${API.posts.byId(postId)}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get post by id: ", error);
    throw error;
  }
}

export const deletePosts = async (postIds: number[]) => {
  try {
    const response = await axiosInstance.delete(`${API.posts.list()}`, {
      data: postIds,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error delete video: ", error);
    throw error;
  }
}

export const getExportedData = async (postId: string | number, type: string = "extracted_poses") => {
  try {
    const response = await axiosInstance.get(
      `${API.posts.export(postId, type)}`,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/zip',
        },
        withCredentials: true,
      }
    )
    return response;
  } catch (error) {
    console.log("Error get drawn 3D: ", error);
    throw error;
  }
}


export const toggleLikePost = async (id: number | string) => {
  const res = await axiosInstance.post(
    API.posts.like(id), {
    withCredentials: true
  })
  return res.data;
}


export const updatePostCaption = async (postId: number | string, caption: string) => {
  try {
    const response = await axiosInstance.put(API.posts.byId(postId), { caption }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error update post caption: ", error);
    throw error;
  }
}