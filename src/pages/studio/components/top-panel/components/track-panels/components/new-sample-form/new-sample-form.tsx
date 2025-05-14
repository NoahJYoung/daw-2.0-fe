"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";

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

  const getNoteName = (name: string) => {
    return name.replace("#", "♯").replace("b", "♭");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-screen overflow-y-auto bg-surface-1 border-surface-1 text-surface-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-surface-6">
              Create a New Sample Pack
            </DialogTitle>
            <DialogDescription className="text-surface-6">
              {`Creating sample pack from ${tracks.length} samples:`}
              <ul className="list-style-none w-full overflow-y-auto grid grid grid-cols-6 gap-2 max-h-32 p-2 rounded-xs ">
                {tracks.map((track) => (
                  <li key={track.id} className="text-surface-6 ">
                    <Badge
                      style={{ background: track.color }}
                      className="bg-zinc-600 text-black font-semibold"
                    >
                      {getNoteName(track.name)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-surface-6">
                Sample Pack Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-surface-5 text-surface-6 rounded-xs"
                placeholder="e.g., Deep House Essentials"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-surface-6">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-transparent border-surface-5 text-surface-6 min-h-[100px] resize-none rounded-xs"
                placeholder="Describe your sample pack..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cover" className="text-surface-6">
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
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md bg-transparent border-surface-5 text-surface-6 cursor-pointer hover:bg-surface-2 transition-all transition-300"
                  >
                    <Upload className="w-8 h-8 text-zinc-500 mb-2 rounded-xs" />
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
          <DialogFooter className="flex-col-reverse gap-2 lg:flex-row bg-transparent flex justify-evenly w-full lg:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-surface-6 hover:bg-surface-2 inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-1 hover:bg-brand-2 text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
              disabled={!name || !tracks.length}
            >
              Save Sample Pack
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
