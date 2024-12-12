import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshToken = async (): Promise<{
  accessToken: string;
}> => {
  try {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      { refreshToken: storedRefreshToken },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Unable to refresh token:", error);
    throw error;
  }
};
