import { AuxSend, Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { AuxSendListItem } from "./components";
import { useState } from "react";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { IoAdd } from "react-icons/io5";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { useAudioEngine } from "@/pages/studio/hooks";

const btnClassName = `rounded-xs focus-visible:ring-0 text-2xl relative flex items-center justify-center p-1 w-1/5 h-7 bg-surface-2 text-surface-5 hover:bg-surface-3`;

interface AuxRoutesProps {
  title: string;
  routes: AuxSend[];
  existingRouteOptions: Track[];
  newRouteOptions: Track[];
  onCreate: (selectedTrack: Track) => void;
  onDelete: (id: string) => void;
  mode?: "send" | "receive";
}

export const AuxRoutes = observer(
  ({
    routes,
    existingRouteOptions,
    newRouteOptions,
    onCreate,
    onDelete,
    title,
    mode = "send",
  }: AuxRoutesProps) => {
    const [selectedSend, setSelectedSend] = useState<Track | null>(null);
    const { mixer } = useAudioEngine();

    const handleCreate = () => {
      if (selectedSend) {
        onCreate(selectedSend);
        setSelectedSend(null);
      }
    };

    return (
      <div className="flex flex-col gap-2 w-full h-full max-h-[275px] p-1 border rounded-sm border-surface-2">
        <h5 className="text-surface-5 font-bold px-1">{title}</h5>
        <span className="px-1 flex w-full items-center gap-2 justify-between">
          <span className="w-4/5">
            <StudioDropdown
              disabled={newRouteOptions.length === 0}
              options={newRouteOptions.map((track) => ({
                label: track.name,
                value: track.id,
              }))}
              value={selectedSend?.id || null}
              colorOffset={0}
              placeholder="Select a track"
              icon={<MdOutlineSettingsInputComponent />}
              onChange={(trackId) =>
                setSelectedSend(
                  mixer.tracks.find(
                    (mixerTrack) => mixerTrack.id === trackId
                  ) || null
                )
              }
            />
          </span>
          <StudioButton
            className={btnClassName}
            icon={IoAdd}
            disabled={!selectedSend}
            onClick={handleCreate}
          />
        </span>
        <ul className="w-full flex flex-col p-1 pr-1 gap-1 h-full max-h-[182px] overflow-y-auto styled-scrollbar">
          {routes.map((send, i) => (
            <AuxSendListItem
              isLastItem={i === routes.length - 1}
              onDelete={onDelete}
              key={send.id}
              send={send}
              options={existingRouteOptions}
              mode={mode}
            />
          ))}
        </ul>
      </div>
    );
  }
);
