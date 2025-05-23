import {
  Outlet,
  createRoute,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { AuthComponent, Dashboard, Studio } from "@/pages";
import { ProjectsDashboard } from "@/pages/dashboard/projects-dashboard";
import {
  SampleEditor,
  SamplesDashboard,
} from "@/pages/dashboard/samples-dashboard";
import { AuthProvider } from "@/context/auth-context";
import { AuthCallback } from "@/pages/auth/auth-callback";

const isInAuthFlow = () => {
  const url = new URL(window.location.href);
  return (
    url.pathname.includes("/auth/callback") ||
    url.searchParams.has("access_token") ||
    url.searchParams.has("code")
  );
};

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
    if (!isInAuthFlow()) {
      throw redirect({
        to: "/app/projects",
        replace: true,
      });
    }
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
    if (!isInAuthFlow()) {
      throw redirect({
        to: "/app/projects",
        replace: true,
      });
    }
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
  path: "/auth",
  component: () => <AuthComponent />,
});

const newProjectRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "projects/studio",
  component: () => <Studio />,
});

const existingProjectRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "projects/studio/$projectId",
  component: () => <Studio />,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: () => <AuthCallback />,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authCallbackRoute,
  dashboardLayoutRoute.addChildren([
    dashboardIndexRoute,
    projectsDashboardRoute,
    samplesDashboardRoute,
    editSamplesDashboardRoute,
    createSamplesDashboardRoute,
    authRoute,
    newProjectRoute,
    existingProjectRoute,
  ]),
]);
