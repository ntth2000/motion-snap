import type { AxiosProgressEvent } from "axios";
import { API } from "../constants";
import axiosInstance from "./_apiBase";

export const uploadVideo = async (
  file: File,
  title: string,
  description: string,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  try {
    const url = API.VIDEOS + '/upload';
    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("description", description);
    console.log(formData)

    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}