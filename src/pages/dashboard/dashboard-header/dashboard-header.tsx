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
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const DashboardHeader = () => {
  const { toggleTheme } = useThemeContext();
  const location = useLocation();
  const { isLoggedIn, signOut, user } = useAuth();

  const name = user?.identities?.[0]?.identity_data?.name;
  const avatarUrl = user?.identities?.[0]?.identity_data?.avatar_url;

  const initials = `${[(name || "")?.split(" ")?.[0], name?.split(" ")?.[1]]
    .join("")
    .toUpperCase()}`;

  const isInsideStudio = location.pathname.includes("studio");

  return isInsideStudio ? null : (
    <header className="flex w-full top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <img src="/logo32.png" />
        <span className="text-lg hidden sm:block">Velocity</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/app/projects">
                <NavigationMenuLink
                  active={location.pathname === "/app/projects"}
                  className={navigationMenuTriggerStyle()}
                >
                  <FileAudio />
                  <span className="hidden lg:block">Projects</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/app/samples">
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
          <DropdownMenuTrigger className={navigationMenuTriggerStyle()} asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:rounded-md"
            >
              <Settings className="h-6 w-6 text-primary" />
              <span className="hidden lg:block">Settings</span>
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleTheme}>
              Toggle Theme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={isLoggedIn ? undefined : navigationMenuTriggerStyle()}
            asChild
          >
            <Button variant="ghost" size="icon" className="rounded-full">
              {isLoggedIn ? (
                <Avatar>
                  <AvatarImage src={avatarUrl} alt="profile_image" />
                  <AvatarFallback>{initials ?? ""}</AvatarFallback>
                </Avatar>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span className="hidden lg:block">Account</span>
                </>
              )}
              <span className="sr-only">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isLoggedIn ? (
              <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
            ) : (
              <Link to="/app/signin">
                <DropdownMenuItem className="w-full text-center">
                  Sign In
                </DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
