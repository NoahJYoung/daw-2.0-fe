import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import {
  useAudioEngine,
  useDeferredUpdate,
  useUndoManager,
} from "@/pages/studio/hooks";
import { t } from "i18next";
import { observer } from "mobx-react-lite";
import { CiZoomOut, CiZoomIn, CiRedo, CiUndo } from "react-icons/ci";
import {
  BsAlignStart as QuantizeStartIcon,
  BsAlignEnd as QuantizeEndIcon,
  BsAlignCenter as QuantizeFullNoteIcon,
} from "react-icons/bs";
import {
  MdContentPasteGo as PasteIcon,
  MdOutlineContentCopy as CopyIcon,
} from "react-icons/md";
import { HiOutlineTrash as DeleteIcon } from "react-icons/hi";
import { StudioDropdownMenu } from "@/components/ui/custom/studio/studio-dropdown-menu";
import {
  NoteValue,
  SubdivisionSelectOptions,
} from "@/pages/studio/audio-engine/components/timeline/types";
import { PiSelectionAllThin as SelectAllIcon } from "react-icons/pi";
import { Slider } from "@/components/ui/slider";
import { pasteNotes } from "../piano-roll/hooks/actions";
import { LiaMousePointerSolid as MouseIcon } from "react-icons/lia";
import { PiPencilSimpleDuotone as PencilIcon } from "react-icons/pi";
import { useRef } from "react";
import { Note } from "@/components/ui/custom/note";

const MIN_VELOCITY = 0;
const MAX_VELOCITY = 127;

interface ToolBarProps {
  clip: MidiClip;
}

export const ToolBar = observer(({ clip }: ToolBarProps) => {
  const { undoManager } = useUndoManager();
  const { clipboard } = useAudioEngine();

  const velocityRef = useRef<HTMLInputElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      if (clip.velocity > MIN_VELOCITY) {
        clip.setVelocity(clip.velocity - 1);
      }
    } else {
      if (clip.velocity < MAX_VELOCITY) {
        clip.setVelocity(clip.velocity + 1);
      }
    }
  };

  const handleVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    const inRange =
      newValue && newValue >= MIN_VELOCITY && newValue <= MAX_VELOCITY;

    if (inRange) {
      clip.setVelocity(newValue);
    }
  };

  const updateClipQuantization = (value: number) =>
    clip.setQuantizePercentage(value);
  const { onValueChange: onValueChange, onValueCommit: commitValueChange } =
    useDeferredUpdate<number[]>([clip.quantizePercentage], (values) =>
      updateClipQuantization(values[0])
    );

  return (
    <div className="flex items-center gap-1 justify-between min-w-screen min-h-[2rem] no-scrollbar overflow-x-scroll md:justify-evenly">
      <span className="flex flex-shrink-0 w-content min-h-[2rem] items-center gap-1">
        <StudioButton
          title={t("studio.toolbar.undo")}
          disabled={!undoManager.canUndo}
          icon={CiUndo}
          onClick={() => undoManager.undo()}
        />
        <StudioButton
          title={t("studio.toolbar.redo")}
          disabled={!undoManager.canRedo}
          icon={CiRedo}
          onClick={() => undoManager.redo()}
        />

        <StudioButton
          title={t("studio.toolbar.zoomOut")}
          disabled={!clip.canZoomOut}
          icon={CiZoomOut}
          onClick={() => undoManager.withoutUndo(() => clip.zoomOut())}
        />
        <StudioButton
          title={t("studio.toolbar.zoomIn")}
          disabled={!clip.canZoomIn}
          icon={CiZoomIn}
          onClick={() => undoManager.withoutUndo(() => clip.zoomIn())}
        />
      </span>

      <span className="flex items-center gap-1">
        <StudioDropdownMenu
          disabled={clip.selectedNotes.length < 1}
          triggerIcon={QuantizeStartIcon}
          title={t("studio.toolbar.quantize")}
          onValueChange={() => {}}
          options={[
            {
              label: "Full Note",
              disabled: clip.selectedNotes.length < 1,
              icon: QuantizeFullNoteIcon,
              onClick: () =>
                undoManager.withGroup(() => clip.quantizeSelectedNotes()),
            },
            {
              label: "Start",
              disabled: clip.selectedNotes.length < 1,
              icon: QuantizeStartIcon,
              onClick: () =>
                undoManager.withGroup(() => clip.quantizeSelectedOn()),
            },
            {
              label: "End",
              disabled: clip.selectedNotes.length < 1,
              icon: QuantizeEndIcon,
              onClick: () =>
                undoManager.withGroup(() => clip.quantizeSelectedOff()),
            },
            { separator: true },
            {
              render: () => (
                <span className="flex gap-1 w-[120px] items-center justify-between">
                  <Slider
                    className="max-w-[80px] text-surface-5 flex-shrink-0"
                    value={[clip.quantizePercentage]}
                    onValueChange={onValueChange}
                    onValueCommit={commitValueChange}
                    min={0}
                    max={1}
                    step={0.01}
                    orientation="horizontal"
                  />
                  <p className="text-surface-5 text-sm w-[40px] flex-shrink-0 text-center">{`${Math.round(
                    clip.quantizePercentage * 100
                  )}%`}</p>
                </span>
              ),
            },
          ]}
        />

        <StudioDropdownMenu
          triggerIcon={() => (
            <Note className="w-6 h-6" value={clip.subdivision as NoteValue} />
          )}
          title={t("studio.toolbar.subdivision")}
          value={clip.subdivision}
          onValueChange={(newValue) => clip.setSubdivision(newValue)}
          options={SubdivisionSelectOptions.map((option) => ({
            label: option.label,
            value: option.value,
            icon: () => <Note className="w-5 h-5" value={option.value} />,
            disabled: false,
          }))}
        />
        <input
          ref={velocityRef}
          min={MIN_VELOCITY}
          max={MAX_VELOCITY}
          disabled={clip.selectedNotes.length < 1}
          type="number"
          className="text-surface-4 w-[56px] h-[32px] border border-surface-2 text-md bg-surface-mid focus:bg-surface-2 focus:select-text p-1 text-ellipsis focus:outline-none"
          value={clip.velocity}
          onChange={handleVelocityChange}
          onWheel={handleWheel}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              velocityRef?.current?.blur();
            }
          }}
        />
      </span>

      <span className="flex items-center gap-1">
        <StudioDropdownMenu
          triggerIcon={clip.action === "select" ? MouseIcon : PencilIcon}
          title={t("studio.toolbar.action")}
          onValueChange={(value) =>
            undoManager.withoutUndo(() =>
              clip.setAction(value as "select" | "create")
            )
          }
          options={[
            {
              label: "Select",
              icon: MouseIcon,
              value: "select",
            },
            {
              label: "Create",
              icon: PencilIcon,
              value: "create",
            },
          ]}
        />

        <StudioButton
          title={t("studio.toolbar.selectAll")}
          disabled={clip.events.length < 1}
          icon={SelectAllIcon}
          onClick={() =>
            undoManager.withGroup("SELECT ALL NOTES", () => {
              clip.selectAllNotes();
            })
          }
        />
        <StudioButton
          title={t("studio.toolbar.delete")}
          disabled={clip.selectedNotes.length < 1}
          icon={DeleteIcon}
          onClick={() =>
            undoManager.withGroup("DELETE SELECTED NOTES", () => {
              clip.deleteSelectedNotes();
            })
          }
        />

        <StudioButton
          title={t("studio.toolbar.copy")}
          disabled={clip.selectedNotes.length < 1}
          icon={CopyIcon}
          onClick={() => clipboard.copy(clip.selectedNotes)}
        />
        <StudioButton
          title={t("studio.toolbar.paste")}
          disabled={clipboard.getNotes().length < 1}
          icon={PasteIcon}
          onClick={() => pasteNotes(clipboard, clip, undoManager)}
        />
      </span>
    </div>
  );
});
