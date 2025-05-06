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
import { AuthCallback } from "@/pages/auth-callback";

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
  getParentRoute: () => dashboardLayoutRoute,
  path: "projects/studio",
  component: () => <Studio />,
});

const existingProjectRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "projects/studio/$projectId",
  component: () => <Studio />,
});

// Add the auth callback route at the root level
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: () => <AuthCallback />,
});

// // Add a popup signin route for initiating signin in popup window
// const popupSignInRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/auth/popup-signin",
//   component: () => <PopupSignIn />,
// });

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authCallbackRoute, // Add auth callback at root level
  // popupSignInRoute, // Add popup signin at root level
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
