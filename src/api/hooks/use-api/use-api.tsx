/* eslint-disable react-refresh/only-export-components */
import { AxiosInstance } from "axios";
import { api, refreshToken } from "@/api";
import { createContext, useContext, useMemo, useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const ApiContext = createContext<AxiosInstance | undefined>(undefined);

export const useApi = (): AxiosInstance => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = () => {
  const contextValue = useMemo(() => api, []);
  const queryClient = useQueryClient();

  useEffect(() => {
    api.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { accessToken: newAccessToken } = await refreshToken();
            localStorage.setItem("accessToken", newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // navigate({ to: `/${RoutePaths.ACCESS}` });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }, [queryClient]);

  return (
    <ApiContext.Provider value={contextValue}>
      <Outlet />
    </ApiContext.Provider>
  );
};
