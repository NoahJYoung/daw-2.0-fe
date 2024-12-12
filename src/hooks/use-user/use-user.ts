import { useCurrentAuthenticatedUser } from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";

export const useUser = () => {
  const { user, isLoadingUser } = useCurrentAuthenticatedUser();
  const queryClient = useQueryClient();

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.setQueryData(["/users/me"], null);
  };

  const isLoggedIn = !!user || isLoadingUser;

  return {
    user,
    isLoadingUser,
    logout,
    isLoggedIn,
  };
};
