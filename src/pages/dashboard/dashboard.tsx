import { Outlet } from "@tanstack/react-router";
import { DashboardHeader } from "./dashboard-header";

export const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader />
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  );
};
