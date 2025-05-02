import { Outlet } from "@tanstack/react-router";
import { DashboardHeader } from "./dashboard-header";

export const Dashboard = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DashboardHeader />
      <main className="flex-1 h-[calc(100%-80px)] overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
