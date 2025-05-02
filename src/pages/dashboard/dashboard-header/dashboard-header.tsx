import { Search, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

export const DashboardHeader = () => {
  return (
    <header className="flex w-full top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <img src="/logo32.png" />
        <span className="text-lg">Velocity</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <form className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="w-64 pl-8 bg-background"
          />
        </form>

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
