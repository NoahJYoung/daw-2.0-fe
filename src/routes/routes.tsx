import { RouteObject } from "react-router-dom";
import { RoutePaths } from "./route-paths";
import { Studio } from "@/pages";

export const routes: RouteObject[] = [
  {
    path: RoutePaths.ROOT,
    element: <div>Hello World</div>,
  },
  {
    path: RoutePaths.STUDIO,
    element: <Studio />,
  },
  {
    path: `${RoutePaths.STUDIO}/:projectId`,
    element: <Studio />,
  },
];
