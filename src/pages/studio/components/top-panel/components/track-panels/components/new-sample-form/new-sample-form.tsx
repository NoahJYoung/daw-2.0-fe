"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Check } from "lucide-react";
import { useFileSystem } from "@/hooks";
import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { useToast } from "@/components/ui/use-toast";
import {
  createSamplesZip,
  SampleMap,
} from "@/pages/dashboard/samples-dashboard/components/sample-editor/helpers";
import { bufferToWav } from "@/pages/studio/utils";

interface SamplePackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[];
}

export const SamplePackForm = ({
  open,
  onOpenChange,
  tracks,
}: SamplePackFormProps) => {
  const [name, setName] = useState("New Sample Pack");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { saveSamplePack } = useFileSystem();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const samplesMap: SampleMap = {};

    try {
      await Promise.all(
        tracks.map(async (track) => {
          if (track.clips.length > 0) {
            const clip = track.clips[0];
            if (clip instanceof AudioClip) {
              const audioBuffer = clip.player.buffer;
              if (!audioBuffer) {
                throw new Error("Audio buffer not found for clip.");
              }

              console.log(audioBuffer);

              const file = await bufferToWav(audioBuffer, `${track.name}.wav`);

              const newSample = {
                file,
                name: track.name,
              };
              samplesMap[track.name] = newSample;
              console.log("Sample added to samplesMap", newSample);
            }
          }
        })
      );

      const zipBlob = await createSamplesZip(
        name,
        description,
        samplesMap,
        coverImage
      );

      await saveSamplePack(name, zipBlob);

      toast({
        title: "Success",
        description: "Sample pack created successfully.",
        variant: "default",
      });

      onOpenChange(false);
      setName("");
      setDescription("");
      setCoverImage(null);
      setPreviewUrl(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as Error).message || "Failed to create sample pack.",
        variant: "destructive",
      });
    }
  };

  const clearImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-surf border-surface-1 text-surface-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Create a New Sample Pack
            </DialogTitle>
            {/* <DialogDescription className="text-zinc-400">
              Fill in the details for your new sample pack.
            </DialogDescription> */}
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">
                Sample Pack Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="e.g., Deep House Essentials"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="Describe your sample pack..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cover" className="text-white">
                Cover Image
              </Label>
              {!previewUrl ? (
                <div className="relative">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="cover"
                    className="flex flex-col items-center justify-center w-full h-32 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-750"
                  >
                    <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                    <span className="text-sm text-zinc-500">
                      Click to upload cover image
                    </span>
                  </Label>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-zinc-800 rounded-md overflow-hidden">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="bg-zinc-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              <Check className="mr-2 h-4 w-4" /> Save Sample Pack
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
