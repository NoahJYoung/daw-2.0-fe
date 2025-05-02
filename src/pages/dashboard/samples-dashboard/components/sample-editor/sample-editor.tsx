import { useState } from "react";
import { ArrowLeft, Save, Upload, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToneAudioBuffer } from "tone";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const OCTAVES = [1, 2, 3, 4, 5, 6, 7, 8];

type SampleData = {
  file: File | null;
  name: string;
};

type SampleMap = {
  [key: string]: SampleData;
};

export const SampleEditor = () => {
  const [packName, setPackName] = useState("New Sample Pack");
  const [packDescription, setPackDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [samples, setSamples] = useState<SampleMap>({});
  const [previewingNote, setPreviewingNote] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(
    null
  );

  const initAudioContext = () => {
    if (!audioContext) {
      const newContext = new AudioContext();
      setAudioContext(newContext);
      return newContext;
    }
    return audioContext;
  };

  const handleFileUpload = (octave: number, note: string, file: File) => {
    const noteId = `${note}${octave}`;
    setSamples({
      ...samples,
      [noteId]: {
        file,
        name: file.name,
      },
    });
  };

  const previewSample = async (noteId: string) => {
    if (!samples[noteId]?.file) return;

    setPreviewingNote(noteId);
    const context = initAudioContext();

    if (audioSource) {
      audioSource.stop();
      setAudioSource(null);
    }

    try {
      const arrayBuffer = await samples[noteId].file!.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      const monoBuffer = new ToneAudioBuffer(audioBuffer).toMono(1).get();

      if (!monoBuffer) {
        throw new Error("Unable to decode audio buffer");
      }

      const source = context.createBufferSource();
      source.buffer = monoBuffer;
      source.connect(context.destination);
      source.start(0);
      setAudioSource(source);

      source.onended = () => {
        setPreviewingNote(null);
        setAudioSource(null);
      };
    } catch (error) {
      console.error("Error playing audio:", error);
      setPreviewingNote(null);
    }
  };

  const stopPreview = () => {
    if (audioSource) {
      audioSource.stop();
      setAudioSource(null);
      setPreviewingNote(null);
    }
  };

  const saveSamplePack = () => {
    const samplePackData = {
      name: packName,
      description: packDescription,
      coverImage: coverImage ? coverImage.name : null,
      samples: Object.keys(samples).map((noteId) => ({
        noteId,
        fileName: samples[noteId].name,
      })),
    };

    console.log("Saving sample pack:", samplePackData);
    alert("Sample pack saved successfully!");
  };

  const getKeyClass = (note: string) => {
    return note.includes("b")
      ? "bg-black text-white h-16 w-10 relative z-10 -mx-5"
      : "bg-white text-black h-24 w-14";
  };

  return (
    <div className="w-full h-full bg-surface-1 px-2 lg:px-0">
      <div className="mx-auto py-3 max-w-7xl bg-surface-1 w-full h-full overflow-y-auto">
        <Link
          className="flex items-center gap-1 text-surface-6 text-sm mb-2 hover:text-surface-7 transition-all transition-300 w-fit"
          to="/dashboard/samples"
        >
          <ArrowLeft />
          Back to samples
        </Link>

        <Card className="bg-surface-0 text-white border-surface-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  <Input
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none p-0 h-auto text-surface-9 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </CardTitle>
                <CardDescription>
                  <Input
                    value={packDescription}
                    onChange={(e) => setPackDescription(e.target.value)}
                    placeholder="Add a description for your sample pack"
                    className="text-sm text-surface-6 bg-transparent border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </CardDescription>
                <div className="mt-4">
                  <Label
                    htmlFor="cover-image"
                    className="text-sm font-medium mb-2 block"
                  >
                    Pack Cover Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-md bg-surface-2 border border-surface-3 flex items-center justify-center overflow-hidden">
                      {coverImage ? (
                        <img
                          src={
                            URL.createObjectURL(coverImage) ||
                            "/placeholder.svg"
                          }
                          alt="Pack cover"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-surface-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          id="cover-image"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setCoverImage(e.target.files[0]);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          className="bg-surface-1 border-surface-3 text-surface-7 hover:bg-surface-2 w-full justify-start"
                        >
                          <Upload className="mr-2 h-4 w-4 bg-surface-1 cursor-pointer hover:bg-surface-2" />
                          {coverImage
                            ? "Change Cover Image"
                            : "Upload Cover Image"}
                        </Button>
                      </div>
                      {coverImage && (
                        <p className="text-xs text-surface-6 mt-1 truncate">
                          {coverImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={currentOctave.toString()}
              onValueChange={(value) =>
                setCurrentOctave(Number.parseInt(value))
              }
            >
              <div className="flex flex-col justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Octave</h3>
                <TabsList className="bg-surface-2">
                  {OCTAVES.map((octave) => (
                    <TabsTrigger
                      key={octave}
                      value={octave.toString()}
                      className="data-[state=active]:bg-surface-3"
                    >
                      {octave}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {OCTAVES.map((octave) => (
                <TabsContent
                  key={octave}
                  value={octave.toString()}
                  className="mt-0"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center mb-2">
                      <div className="flex max-w-full overflow-x-auto no-scrollbar">
                        {NOTES.map((note) => {
                          const noteId = `${note}${octave}`;
                          const hasFile = !!samples[noteId]?.file;

                          return (
                            <div
                              key={note}
                              className={`${getKeyClass(note)} flex flex-col justify-end items-center border border-surface-3 `}
                            >
                              <div className="text-xs font-medium mb-1">
                                {note.replace("b", "♭")}
                                {octave}
                              </div>
                              <div className="flex gap-1 mb-2">
                                {hasFile && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 rounded-full bg-surface-2 hover:bg-surface-3 text-surface-8"
                                    onClick={() =>
                                      previewingNote === noteId
                                        ? stopPreview()
                                        : previewSample(noteId)
                                    }
                                  >
                                    {previewingNote === noteId ? (
                                      <VolumeX className="h-3 w-3" />
                                    ) : (
                                      <Volume2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                      {NOTES.map((note) => {
                        const noteId = `${note}${octave}`;
                        const hasFile = !!samples[noteId]?.file;

                        return (
                          <div key={noteId} className="space-y-2">
                            <Label
                              htmlFor={`file-${noteId}`}
                              className="text-sm font-medium text-surface-8"
                            >
                              {note.replace("b", "♭")}
                              {octave}
                            </Label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id={`file-${noteId}`}
                                  type="file"
                                  accept="audio/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileUpload(
                                        octave,
                                        note,
                                        e.target.files[0]
                                      );
                                    }
                                  }}
                                />
                                <div
                                  className={`flex items-center justify-between px-3 py-2 rounded-md border border-surface-3 ${hasFile ? "bg-surface-2" : "bg-surface-1"}`}
                                >
                                  <span
                                    className={cn(
                                      "text-xs text-surface-5 truncate max-w-[120px]",
                                      { "text-surface-8": hasFile }
                                    )}
                                  >
                                    {hasFile
                                      ? samples[noteId].name
                                      : "No file selected"}
                                  </span>
                                  <Upload className="h-4 w-4 text-surface-6" />
                                </div>
                              </div>
                              {hasFile && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full bg-surface-2 hover:bg-surface-3"
                                  onClick={() =>
                                    previewingNote === noteId
                                      ? stopPreview()
                                      : previewSample(noteId)
                                  }
                                >
                                  {previewingNote === noteId ? (
                                    <VolumeX className="h-4 w-4" />
                                  ) : (
                                    <Volume2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>

          <CardFooter className="border-t border-surface-2 pt-4 flex justify-between">
            <div className="text-sm text-surface-6">
              {Object.keys(samples).length} of 96 samples loaded
            </div>
            <Button
              onClick={saveSamplePack}
              className="bg-brand-1 hover:bg-brand-2 text-white"
            >
              <Save className="mr-2 h-4 w-4 " />
              Save Pack
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
