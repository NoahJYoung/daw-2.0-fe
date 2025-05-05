import {
  Outlet,
  createRoute,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { Dashboard, SignIn, Studio } from "@/pages";
import { ProjectsDashboard } from "@/pages/dashboard/projects-dashboard";
import {
  SampleEditor,
  SamplesDashboard,
} from "@/pages/dashboard/samples-dashboard";
import { AuthProvider } from "@/context/auth-context";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/app/projects",
      replace: true,
    });
  },
  component: () => null,
});

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: () => <Dashboard />,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/app/projects",
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

const samplesDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/samples",
  component: () => <SamplesDashboard />,
});

const editSamplesDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/samples/$samplePackId",
  component: () => <SampleEditor />,
});

const createSamplesDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/samples/new",
  component: () => <SampleEditor />,
});

const authRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/signin",
  component: () => <SignIn />,
});

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
    samplesDashboardRoute,
    editSamplesDashboardRoute,
    createSamplesDashboardRoute,
    authRoute,
  ]),
  newProjectRoute,
  existingProjectRoute,
]);
