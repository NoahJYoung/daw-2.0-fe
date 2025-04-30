import {
  Outlet,
  createRoute,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { Dashboard, Studio } from "@/pages";
import { ProjectsDashboard } from "@/pages/dashboard/projects-dashboard"; // You'll need to create this

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard/projects",
      replace: true,
    });
  },
  component: () => null,
});

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => <Dashboard />,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard/projects",
      replace: true,
    });
  },
  component: () => null,
});

const projectsDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/projects",
  component: () => <ProjectsDashboard />,
});

// const samplesDashboardRoute = createRoute({
//   getParentRoute: () => dashboardLayoutRoute,
//   path: "/samples",
//   component: () => <SamplesDashboard />,
// });

// Studio routes remain at the root level (no header)
const newProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio",
  component: () => <Studio />,
});

const existingProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio/$projectId",
  component: () => <Studio />,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardLayoutRoute.addChildren([
    dashboardIndexRoute,
    projectsDashboardRoute,
    // samplesDashboardRoute,
  ]),
  newProjectRoute,
  existingProjectRoute,
]);
