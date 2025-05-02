import { observer } from "mobx-react-lite";
import {
  useAudioEngine,
  useBottomPanelViewController,
  useUndoManager,
} from "../../hooks";
import {
  KeyboardView,
  MidiClipExpandedView,
  MixerView,
  TrackEffectsView,
} from "./components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MidiClip } from "../../audio-engine/components";
import { PanelMode } from "../../audio-engine/components/mixer/types";

export const BottomPanel = observer(() => {
  const { windowSize } = useBottomPanelViewController();
  const { undoManager } = useUndoManager();

  const { mixer } = useAudioEngine();

  const tabsListRef = useRef<HTMLDivElement>(null);

  const triggerClassName =
    "data-[state=active]:border-b-surface-6 focus:ring-0 select-none data-[state=active]:text-surface-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 hover:bg-surface-2 rounded-xs w-48";

  const contentClassName = cn(
    "w-full lg:pt-2 h-full bg-transparent 2xl:justify-center 2xl:w-full"
  );

  return (
    <Tabs
      activationMode="manual"
      value={mixer.panelMode}
      onValueChange={(e) =>
        undoManager.withoutUndo(() => mixer.setPanelMode(e as PanelMode))
      }
      defaultValue="MIXER"
      className="w-full h-full lg:min-h-[300px] bg-transparent flex flex-col items-center"
    >
      <TabsList
        ref={tabsListRef}
        className="pb-1 w-full flex max-w-[1068px] justify-between gap-1 bg-transparent rounded-xs lg:px-1 lg:pb-3 lg:pt-3"
      >
        <TabsTrigger className={triggerClassName} value="MIXER">
          Mixer
        </TabsTrigger>
        <TabsTrigger className={triggerClassName} value="KEYBOARD">
          Keyboard
        </TabsTrigger>
        <TabsTrigger
          className={triggerClassName}
          disabled={!mixer.featuredTrack}
          value="TRACK_FX"
        >
          Track
        </TabsTrigger>
        <TabsTrigger
          className={triggerClassName}
          disabled={!mixer.featuredClip}
          value={
            mixer.featuredClip?.type === "audio"
              ? "WAVEFORM_VIEW"
              : "PIANO_ROLL"
          }
        >
          Clip
        </TabsTrigger>
      </TabsList>

      <div
        className={cn(
          "bg-transparent w-full h-full  flex items-start",
          { "justify-center": windowSize.width > 1360 },
          { "justify-start": windowSize.width < 1360 }
        )}
      >
        <TabsContent
          style={
            mixer.panelMode === "MIXER"
              ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  alignItems: windowSize.width >= 1360 ? "center" : "start",
                }
              : undefined
          }
          className={contentClassName}
          value="MIXER"
        >
          <MixerView />
        </TabsContent>

        <TabsContent
          style={
            mixer.panelMode === "KEYBOARD"
              ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  alignItems: windowSize.width >= 1360 ? "center" : "start",
                }
              : undefined
          }
          className={cn(contentClassName)}
          value="KEYBOARD"
        >
          <KeyboardView />
        </TabsContent>

        <TabsContent
          style={
            mixer.panelMode === "TRACK_FX" ? { display: "flex" } : undefined
          }
          className={contentClassName}
          value="TRACK_FX"
        >
          {mixer.featuredTrack ? (
            <TrackEffectsView track={mixer.featuredTrack} />
          ) : (
            <span>No track selected</span>
          )}
        </TabsContent>
        <TabsContent
          style={
            mixer.panelMode === "WAVEFORM_VIEW"
              ? { display: "flex" }
              : undefined
          }
          className={contentClassName}
          value="WAVEFORM_VIEW"
        >
          {mixer.featuredClip ? (
            <span>{`Audio: ${mixer.featuredClip.id}`}</span>
          ) : (
            <span>No clip selected</span>
          )}
        </TabsContent>
        <TabsContent
          style={
            mixer.panelMode === "PIANO_ROLL"
              ? {
                  display: "flex",
                }
              : undefined
          }
          className={contentClassName}
          value="PIANO_ROLL"
        >
          {!!mixer.featuredClip && mixer.featuredClip instanceof MidiClip ? (
            <MidiClipExpandedView clip={mixer.featuredClip} />
          ) : (
            <span>No clip selected</span>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
});
