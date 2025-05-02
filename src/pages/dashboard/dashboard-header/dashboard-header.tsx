import { Music2, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const DashboardHeader = () => {
  return (
    <header className="flex w-full top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <img src="/logo32.png" />
        <span className="text-lg">Velocity</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Music2 className="h-6 w-6 text-primary" />
          <span className="sr-only">Settings</span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Account</span>
        </Button>
      </div>
    </header>
  );
};
