import { Outlet, createRoute, createRootRoute } from "@tanstack/react-router";
import { Dashboard, Studio } from "@/pages";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    return <Dashboard />;
  },
});

const newProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio",
  component: () => {
    return <Studio />;
  },
});

const existingProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio/$projectId",
  component: () => {
    return <Studio />;
  },
});

export const routeTree = rootRoute.addChildren([
  dashboardRoute,
  newProjectRoute,
  existingProjectRoute,
]);
