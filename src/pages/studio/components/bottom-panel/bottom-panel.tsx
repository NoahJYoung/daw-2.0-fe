import { observer } from "mobx-react-lite";
import { useBottomPanelViewController } from "../../hooks";
import { PanelMode } from "../../hooks/use-bottom-panel-view-controller/use-bottom-panel-view-controller";
import { MixerView } from "./components";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";

export const BottomPanel = observer(() => {
  const { mode, selectedClip, selectedTrack, setMode, windowSize } =
    useBottomPanelViewController();
  const tabsListRef = useRef<HTMLDivElement>(null);

  const triggerClassName =
    "data-[state=active]:border-b-surface-6 select-none data-[state=active]:text-surface-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 hover:bg-surface-2 rounded-xxs w-48";

  const contentClassName = "w-full pt-2 h-full bg-transparent";

  return (
    <Tabs
      value={mode}
      onValueChange={(e) => setMode(e as PanelMode)}
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
          disabled={!selectedTrack}
          value="TRACK_FX"
        >
          Track
        </TabsTrigger>
        <TabsTrigger
          className={triggerClassName}
          disabled={!selectedClip}
          value={
            selectedClip?.type === "audio" ? "WAVEFORM_VIEW" : "PIANO_ROLL"
          }
        >
          Clip
        </TabsTrigger>
      </TabsList>

      <div className="bg-transparent w-full h-full overflow-x-auto styled-scrollbar flex ">
        <TabsContent className={contentClassName} value="MIXER">
          <MixerView />
        </TabsContent>

        <TabsContent className={contentClassName} value="KEYBOARD">
          KEYBOARD
        </TabsContent>

        <TabsContent className={contentClassName} value="TRACK_FX">
          {selectedTrack ? (
            <span>{`${selectedTrack.name}`}</span>
          ) : (
            <span>No track selected</span>
          )}
        </TabsContent>
        <TabsContent className={contentClassName} value="WAVEFORM_VIEW">
          {selectedClip ? (
            <span>{`Audio: ${selectedClip.id}`}</span>
          ) : (
            <span>No clip selected</span>
          )}
        </TabsContent>
        <TabsContent className={contentClassName} value="PIANO_ROLL">
          {selectedClip ? (
            <span>{`MIDI: ${selectedClip.id}`}</span>
          ) : (
            <span>No clip selected</span>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
});
