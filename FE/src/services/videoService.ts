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

    const response = await axiosInstance.post(API.videos.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
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
    const response = await axiosInstance.get(`${API.videos.list}/${videoId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get video by ID: ", error);
    throw error;
  }
}


export const deleteVideo = async (videoId: number) => {
  try {
    const response = await axiosInstance.delete(`${API.videos.list}/${videoId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error delete video: ", error);
    throw error;
  }
}


export const extractPoses = async (videoId: number) => {
  try {
    const response = await axiosInstance.post(`${API.videos.extractPoses(videoId)}`, null, {
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
    const response = await axiosInstance.post(`${API.videos.draw3D(videoId)}`, null, {
      withCredentials: true,
    });
    console.log('Draw 3D response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error draw 3D: ", error);
    throw error;
  }
}


export const getExtractedFramesById = async (videoId: string) => {
  try {
    const response = await axiosInstance.get(`${API.videos.list}/${videoId}/extracted_frames`, {
      withCredentials: true,
    });
    console.log('Get extracted frames response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error get extracted frames: ", error);
    throw error;
  }
}


export const getExtractedPosesById = async (videoId: number) => {
  try {
    const response = await axiosInstance.get(`${API.videos.list}/${videoId}/extracted_poses`, {
      withCredentials: true,
    });
    console.log('Get extracted poses video response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error get extracted poses video: ", error);
    throw error;
  }
}


export const getDrawn3DById = async (videoId: number) => {
  try {
    const response = await axiosInstance.get(`${API.videos.list}/${videoId}/drawn_3d`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error get drawn 3D: ", error);
    throw error;
  }
}


export const getExportedData = async (videoId: string, type: string = "extracted_poses") => {
  try {
    const response = await axiosInstance.get(
      `${API.videos.list}/${videoId}/export?export_type=${type}`,
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


export const getJobStatus = async (videoId: number) => {
  console.log("cal getJobStatus")
  try {
    const response = await axiosInstance.get(`${API.videos.status(videoId)}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error getJobStatus: ", error);
    throw error;
  }
}