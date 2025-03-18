/* eslint-disable react-refresh/only-export-components */
import { AxiosInstance } from "axios";
import { api, refreshToken } from "@/api";
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes/route-paths";
import { useQueryClient } from "@tanstack/react-query";

const ApiContext = createContext<AxiosInstance | undefined>(undefined);

export const useApi = (): AxiosInstance => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }: { children?: ReactNode }) => {
  const contextValue = useMemo(() => api, []);
  const navigate = useNavigate();
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
            navigate(`/${RoutePaths.ACCESS}`);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }, [navigate, queryClient]);

  return (
    <ApiContext.Provider value={contextValue}>
      {children ?? null}
      <Outlet />
    </ApiContext.Provider>
  );
};
