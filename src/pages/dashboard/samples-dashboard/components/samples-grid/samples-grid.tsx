import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useFileSystem, useThemeContext } from "@/hooks";
import { SamplePack } from "@/hooks/use-file-system/use-file-system";
import { useState } from "react";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { formatBytes } from "@/hooks/use-file-system/helpers";

export const SamplesGrid = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<SamplePack | null>(null);
  const { toast } = useToast();
  const { theme } = useThemeContext();
  const { samplePacks, deleteSamplePack, getSamplePackById } = useFileSystem();

  const handleDelete = (e: React.MouseEvent, pack: SamplePack) => {
    setDeleteDialogOpen(true);
    e.stopPropagation();
    setPackToDelete(pack);
  };

  const confirmDelete = async () => {
    if (packToDelete) {
      await deleteSamplePack(packToDelete.id);
      toast({
        title: "Success!",
        description: "Sample pack deleted successfully",
      });
    }
    setDeleteDialogOpen(false);
    setPackToDelete(null);
  };

  const handleDownload = (e: React.MouseEvent, packId: string) => {
    e.stopPropagation();
    const pack = getSamplePackById(packId);
    if (pack) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pack.data);
      link.download = `${pack.name}.zip`;
      link.click();

      URL.revokeObjectURL(link.href);
    }
  };

  const maskGradient =
    theme === "dark"
      ? "linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)"
      : "linear-gradient(to bottom, transparent, white 20px, white calc(100% - 20px), transparent)";

  return (
    <>
      <div className="max-w-7xl h-full">
        <div
          className="shrink-0 w-full grid py-2 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-3 h-fit max-h-full overflow-y-auto no-scrollbar"
          style={{
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
          }}
        >
          <div className="min-h-32 h-full w-full flex items-center justify-center">
            <Link to="new" className="flex">
              <div className="h-20 w-20 rounded-full bg-[#fd3574]/5 hover:bg-[#fd3574]/10 hover:scale-105 transition-all transition-300 flex items-center justify-center mb-4">
                <Plus className="h-10 w-10 text-[#fd3574]" />
              </div>
            </Link>
          </div>

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
                <CardDescription className="text-surface-6 max-w-full text-ellipsis">
                  {pack.totalSamples} samples • {` ${formatBytes(pack.size)} `}•
                  Last modified
                  {` ${formatDistanceToNow(new Date(pack.lastModified))} `} ago
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
                  onClick={(e) => handleDownload(e, pack.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-white hover:bg-destructive/80 bg-destructive"
                  onClick={(e) => handleDelete(e, pack)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {packToDelete?.name}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
