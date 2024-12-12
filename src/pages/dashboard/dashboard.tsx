import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";
import { RoutePaths } from "@/routes/route-paths";
import { Navigate, useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => await logout();

  return !user ? (
    <Navigate to={`/${RoutePaths.ACCESS}`} />
  ) : (
    <div className="flex flex-col gap-2">
      <h2>{`Hi, ${user?.name.split(" ")[0] ?? ""}!`}</h2>
      <span className="flex gap-2 items-center">
        <Button onClick={handleLogout}>Log Out</Button>
        <Button onClick={() => navigate(`/${RoutePaths.STUDIO}`)}>
          Studio
        </Button>
      </span>
    </div>
  );
};
