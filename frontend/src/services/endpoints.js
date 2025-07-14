import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const handleRequest = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const get = (url, params) =>
  handleRequest(instance.get(url, { params }));

export const post = (url, data) => handleRequest(instance.post(url, data));

export const put = (url, data) => handleRequest(instance.put(url, data));

export const del = (url) => handleRequest(instance.delete(url));
