import { API_ENDPOINT } from "../constants";

export const getAssetUrl = (path: string | null | undefined) => {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  const cleanPath = path.replace(/\\/g, "/");

  return `${API_ENDPOINT}/${cleanPath}`;
};