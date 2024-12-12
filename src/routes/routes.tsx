import { RouteObject } from "react-router-dom";
import { RoutePaths } from "./route-paths";
import { Access, Dashboard, Studio } from "@/pages";
import { ApiProvider } from "@/api";

export const routes: RouteObject[] = [
  {
    path: "",
    element: <ApiProvider />,
    children: [
      {
        path: RoutePaths.ROOT,
        element: <div>Hi</div>,
      },
      {
        path: RoutePaths.ACCESS,
        element: <Access />,
      },
      {
        path: RoutePaths.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: RoutePaths.STUDIO,
        element: <Studio />,
      },
      {
        path: `${RoutePaths.STUDIO}/:projectId`,
        element: <Studio />,
      },
    ],
  },
];
