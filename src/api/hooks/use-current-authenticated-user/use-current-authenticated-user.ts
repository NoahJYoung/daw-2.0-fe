import { useApi } from "@/api";
import { User } from "@/api/types";
import { useQuery } from "@tanstack/react-query";

const url = "/users/me";

export const useCurrentAuthenticatedUser = () => {
  const api = useApi();

  const fetchUser = async () => {
    const { data: user } = await api.get<User>(url);
    return user;
  };

  const {
    data: user,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [url],
    queryFn: fetchUser,
    retry: false,
  });

  return { user, isLoadingUser: isLoading || isFetching };
};
