import { Button } from "@/components/ui/button";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { cn } from "@/lib/utils";
import { Effect, Track } from "@/pages/studio/audio-engine/components";
import { useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { HiOutlineTrash as DeleteIcon } from "react-icons/hi";

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

const triggerClassName = `rounded-xs focus-visible:ring-0 relative flex items-center justify-center p-1 w-full bg-surface-2 text-surface-7 hover:bg-surface-3`;

interface AuxSendListItemProps {
  effect: Effect;
  track: Track;
  onDelete: (effectId: string) => void;
  isLastItem: boolean;
}

export const EffectsChainListItem = observer(
  ({ effect, onDelete, isLastItem }: AuxSendListItemProps) => {
    const { undoManager } = useUndoManager();
    const handleDelete = () => onDelete(effect.id);
    const handleClick = () => {
      undoManager.withoutUndo(() => effect.setDialogOpen(!effect.dialogOpen));
    };

    return (
      <li
        className={cn(
          "flex w-full items-center gap-0.5 justify-between border-surface-2",
          { "pb-1 border-b": !isLastItem }
        )}
      >
        <span className="w-1/2 md: w-2/3 max-w-full ">
          <StudioButton
            onClick={handleClick}
            className={triggerClassName}
            label={effect.name}
          />
        </span>

        <span className="flex items-center justify-evenly gap-0.5 w-1/3 md:w-1/4 max-w-full">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              effect.setMute(!effect.mute);
            }}
            className={effect.mute ? activeButtonClass : baseButtonClass}
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
