import { API, API_ENDPOINT } from "../constants";
import axiosInstance from "./_apiBase";

export const getAssetUrl = (path: string | null | undefined) => {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  const cleanPath = path.replace(/\\/g, "/");

  return `${API_ENDPOINT}/${cleanPath}`;
};

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


export const getAllVideos = async () => {
  try {
    const response = await axiosInstance.get(API.videos.list, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get all videos: ", error);
    throw error;
  }
}


export const getVideoById = async (videoId: string) => {
  try {
    const response = await axiosInstance.get(`${API.posts.list}/${videoId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get video by ID: ", error);
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


export const extractPoses = async (postId: number) => {
  try {
    const response = await axiosInstance.post(API.posts.extractPoses(postId), null, {
      withCredentials: true,
    });
    console.log('Extract poses response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error extract poses: ", error);
    throw error;
  }
}


export const draw3D = async (postId: number) => {
  try {
    const response = await axiosInstance.post(API.posts.draw3D(postId), null, {
      withCredentials: true,
    });
    console.log('Draw 3D response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error draw 3D: ", error);
    throw error;
  }
}


export const getExtractedFramesById = async (postId: string) => {
  try {
    const response = await axiosInstance.get(`${API.posts.list}/${postId}/extracted_frames`, {
      withCredentials: true,
    });
    console.log('Get extracted frames response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error get extracted frames: ", error);
    throw error;
  }
}


export const getExtractedPosesById = async (postId: number) => {
  try {
    const response = await axiosInstance.get(API.posts.getExtractedPosesById(postId), {
      withCredentials: true,
    });
    console.log('Get extracted poses video response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error get extracted poses video: ", error);
    throw error;
  }
}


export const getDrawn3DById = async (postId: string) => {
  try {
    const response = await axiosInstance.get(API.posts.getDrawn3DById(postId), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get drawn 3D: ", error);
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


export const getJobStatus = async (postId: number) => {
  try {
    const response = await axiosInstance.get(API.posts.status(postId), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error getJobStatus: ", error);
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