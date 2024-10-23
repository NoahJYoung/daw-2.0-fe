import { observer } from "mobx-react-lite";
import { useAudioEngine, useBottomPanelViewController } from "../../hooks";
import { KeyboardView, MidiClipExpandedView, MixerView } from "./components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MidiClip } from "../../audio-engine/components";
import { PanelMode } from "../../audio-engine/components/detail-view-manager/types";

export const BottomPanel = observer(() => {
  const { windowSize } = useBottomPanelViewController();

  const { mixer } = useAudioEngine();

  const tabsListRef = useRef<HTMLDivElement>(null);

  const triggerClassName =
    "data-[state=active]:border-b-surface-6 focus:ring-0 select-none data-[state=active]:text-surface-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 hover:bg-surface-2 rounded-xxs w-48";

  const contentClassName = cn(
    "w-full pt-2 h-full bg-transparent 2xl:justify-center 2xl:w-full"
  );

  return (
    <Tabs
      value={mixer.panelMode}
      onValueChange={(e) => mixer.setPanelMode(e as PanelMode)}
      defaultValue="MIXER"
      style={{ maxHeight: Math.min(windowSize.height, 375) }}
      className="w-full h-full min-h-[300px] bg-transparent flex flex-col items-center"
    >
      <TabsList
        ref={tabsListRef}
        className="w-full flex max-w-[1068px] justify-between gap-1 bg-transparent rounded-xxs pb-3 pt-3"
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
          "bg-transparent w-full h-full overflow-x-auto overflow-y-hidden styled-scrollbar flex items-center flex h-full",
          { "justify-center": window.innerWidth > 1360 },
          { "justify-start": window.innerWidth < 1360 }
        )}
      >
        <TabsContent className={contentClassName} value="MIXER">
          <MixerView />
        </TabsContent>

        <TabsContent
          style={
            mixer.panelMode === "KEYBOARD" ? { display: "flex" } : undefined
          }
          className={contentClassName}
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
            <span>{`${mixer.featuredTrack.name}`}</span>
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
            mixer.panelMode === "PIANO_ROLL" ? { display: "flex" } : undefined
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
