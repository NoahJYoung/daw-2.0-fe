import { Outlet } from "@tanstack/react-router";
import { DashboardHeader } from "./dashboard-header";

export const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardHeader />
      <main className="flex-1 h-full overflow-hidden pt-[56px]">
        <Outlet />
      </main>
    </div>
  );
};
