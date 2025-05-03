import { AudioLines, FileAudio, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";

import { useThemeContext } from "@/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const DashboardHeader = () => {
  const { toggleTheme } = useThemeContext();
  const location = useLocation();
  return (
    <header className="flex w-full top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <img src="/logo32.png" />
        <span className="text-lg hidden sm:block">Velocity</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/dashboard/projects">
                <NavigationMenuLink
                  active={location.pathname === "/dashboard/projects"}
                  className={navigationMenuTriggerStyle()}
                >
                  <FileAudio />
                  <span className="hidden lg:block">Projects</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/dashboard/samples">
                <NavigationMenuLink
                  active={location.pathname.split("/").includes("samples")}
                  className={navigationMenuTriggerStyle()}
                >
                  <AudioLines />
                  <span className="hidden lg:block">Samples</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-6 w-6 text-primary" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleTheme}>
              Toggle Theme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Account</span>
        </Button>
      </div>
    </header>
  );
};
