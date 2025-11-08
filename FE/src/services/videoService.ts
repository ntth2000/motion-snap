import type { AxiosProgressEvent } from "axios";
import { API } from "../constants";
import axiosInstance from "./_apiBase";

export const uploadVideo = async (
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  try {
    const formData = new FormData();
    formData.append("video", file);
    console.log(formData)

    const response = await axiosInstance.post(API.UPLOAD_VIDEO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
      withCredentials: true,
    });

    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}


export const getAllVideos = async () => {
  try {
    const response = await axiosInstance.get(API.VIDEOS, {
      withCredentials: true,
    });
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error get all videos: ", error);
    throw error;
  }
}


export const deleteVideo = async (videoId: number) => {
  try {
    const response = await axiosInstance.delete(`${API.VIDEOS}/${videoId}`, {
      withCredentials: true,
    });
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error delete video: ", error);
    throw error;
  }
}


export const extractPoses = async (videoId: number) => {
  try {
    const response = await axiosInstance.post(`${API.VIDEOS}/${videoId}/extract_poses`, null, {
      withCredentials: true,
    });
    console.log('Extract poses response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error extract poses: ", error);
    throw error;
  }
}


export const draw3D = async (videoId: number) => {
  try {
    const response = await axiosInstance.post(`${API.VIDEOS}/${videoId}/draw_3d`, null, {
      withCredentials: true,
    });
    console.log('Draw 3D response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error draw 3D: ", error);
    throw error;
  }
}