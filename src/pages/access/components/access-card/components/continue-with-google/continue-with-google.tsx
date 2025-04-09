import { api } from "@/api";
import { useToast } from "@/components/ui/use-toast";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

export const ContinueWithGoogle = () => {
  const { toast } = useToast();
  // const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const { data } = await api.post<
        { token: string },
        { data: { accessToken: string; refreshToken: string } }
      >(`${import.meta.env.VITE_API_URL}/auth/google/redirect`, {
        token,
      });

      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // navigate(`/${RoutePaths.DASHBOARD}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: (error as Error).message,
      });
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      text="continue_with"
      theme="filled_blue"
    />
  );
};
