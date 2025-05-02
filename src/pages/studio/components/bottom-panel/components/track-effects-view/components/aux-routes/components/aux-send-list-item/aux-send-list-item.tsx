import { Button } from "@/components/ui/button";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { cn } from "@/lib/utils";
import { AuxSend, Track } from "@/pages/studio/audio-engine/components";
import { trackRef } from "@/pages/studio/audio-engine/components/refs";
import { useDeferredUpdate } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { HiOutlineTrash as DeleteIcon } from "react-icons/hi";

import { MdOutlineSettingsInputComponent } from "react-icons/md";

const btnClassName = `rounded-xs focus-visible:ring-0 text-2xl relative flex items-center justify-center p-1 w-7 h-7 bg-surface-2 text-surface-5 hover:bg-surface-3`;

const activeButtonClass = cn(
  "hover:text-surface-10",
  "shadow-none",
  "flex",
  "items-center",
  "justify-center",
  "rounded-sm p-2 w-6 h-6 m-0 font-bold",
  "border border-primary",
  " bg-transparent",
  "text-surface-10",
  "hover:bg-surface-3"
);

const baseButtonClass = cn(
  "shadow-none",
  "hover:text-surface-6",
  "hover:bg-surface-3",
  "text-surface-5",
  "flex items-center",
  "justify-center",
  "text-surface-5",
  "bg-transparent",
  "rounded-sm",
  "border border-surface-5",
  "p-2",
  "w-6",
  "h-6",
  "m-0",
  "font-bold"
);

interface AuxSendListItemProps {
  send: AuxSend;
  options: Track[];
  onDelete: (sendId: string) => void;
  isLastItem: boolean;
  mode?: "send" | "receive";
}

export const AuxSendListItem = observer(
  ({
    send,
    options,
    onDelete,
    isLastItem,
    mode = "send",
  }: AuxSendListItemProps) => {
    const { onValueChange: onVolumeChange, onValueCommit: commitVolumeChange } =
      useDeferredUpdate<number>(send.volume, (value) => send.setVolume(value));

    const resetVolume = () => send.setVolume(0);

    const handleChange = (value: string) => {
      send.setToRef(trackRef(value));
    };

    const handleDelete = () => onDelete(send.id);

    return (
      <li
        className={cn(
          "flex w-full items-center gap-0.5 justify-between border-surface-2",
          { "pb-1 border-b": !isLastItem }
        )}
      >
        <span className="w-1/2 md:w-2/2 max-w-full ">
          <StudioDropdown
            options={options.map((track) => ({
              label: track.name,
              value: track.id,
            }))}
            value={mode === "send" ? send.to?.id : send.from?.id}
            colorOffset={0}
            placeholder="Aux Send"
            icon={<MdOutlineSettingsInputComponent />}
            onChange={handleChange}
          />
        </span>

        <span className="flex items-center justify-evenly gap-0.5 w-1/2 lg:w-1/3 max-w-full">
          <Knob
            onValueChange={onVolumeChange}
            onValueCommit={commitVolumeChange}
            onDoubleClick={resetVolume}
            value={send.volume}
            step={0.01}
            min={-20}
            max={12}
            size={26}
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              send.setMute(!send.mute);
            }}
            className={send.mute ? activeButtonClass : baseButtonClass}
          >
            M
          </Button>
          <StudioButton
            className={btnClassName}
            icon={DeleteIcon}
            onClick={handleDelete}
          />
        </span>
      </li>
    );
  }
);
