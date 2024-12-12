import { RoutePaths } from "@/routes/route-paths";
import { Navigate } from "react-router-dom";
import { AccessCard } from "./components";
import { useUser } from "@/hooks";

export const Access = () => {
  const { user, isLoadingUser, isLoggedIn } = useUser();

  if (!user && isLoadingUser) {
    return <div>Loading...</div>;
  }

  if (isLoggedIn) {
    return <Navigate to={`/${RoutePaths.DASHBOARD}`} replace />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <AccessCard />
    </div>
  );
};
