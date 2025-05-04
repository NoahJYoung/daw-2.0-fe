import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useFileSystem, useThemeContext } from "@/hooks";

export function SamplesGrid() {
  const { theme } = useThemeContext();
  const { samplePacks } = useFileSystem();

  const maskGradient =
    theme === "dark"
      ? "linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)"
      : "linear-gradient(to bottom, transparent, white 20px, white calc(100% - 20px), transparent)";

  return (
    <div className="max-w-7xl h-full">
      <div
        className="shrink-0 w-full grid py-2 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-3 h-fit max-h-full overflow-y-auto no-scrollbar"
        style={{
          maskImage: maskGradient,
          WebkitMaskImage: maskGradient,
        }}
      >
        <Link to="new" className="block h-full">
          <Card className="bg-surface-0 text-white border-surface-2 border-dashed h-48 lg:h-full flex flex-col items-center justify-center hover:bg-surface-1 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-[#fd3574]/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-[#fd3574]" />
              </div>
              <h3 className="hidden lg:block text-xl font-medium mb-2 text-surface-8">
                New Sample Pack
              </h3>
              <p className="hidden lg:block text-surface-6 text-center">
                Start with an empty template and add your samples
              </p>
            </CardContent>
          </Card>
        </Link>

        {samplePacks.map((pack) => (
          <Card
            key={pack.id}
            className="bg-surface-0 text-white border-surface-2 overflow-hidden h-48 lg:h-full"
          >
            <div className="hidden lg:h-32 lg:block bg-surface-0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-0 flex items-center justify-center">
                  <span className="text-4xl text-surface-8">
                    {pack.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-surface-8">{pack.name}</CardTitle>
              <CardDescription className="text-surface-6">
                {pack.samples} samples • Last modified {pack.lastModified}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-surface-6 max-w-full max-h-full truncate">
              {pack.description}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link to={`${pack.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-surface-3 text-surface-6 hover:bg-surface-2"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-surface-3 text-surface-6 hover:bg-surface-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
