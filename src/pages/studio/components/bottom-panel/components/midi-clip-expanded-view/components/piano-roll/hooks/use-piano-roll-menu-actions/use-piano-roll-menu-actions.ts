import { PiSelectionAllThin as SelectAllIcon } from "react-icons/pi";
import { FiDelete as DeleteIcon } from "react-icons/fi";
import {
  MdContentPasteGo as PasteIcon,
  MdOutlineContentCopy as CopyIcon,
} from "react-icons/md";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { pasteNotes } from "../actions";
import {
  BsAlignStart as QuantizeStartIcon,
  BsAlignEnd as QuantizeEndIcon,
  BsAlignCenter as QuantizeFullNoteIcon,
} from "react-icons/bs";

export const usePianoRollMenuActions = (clip: MidiClip) => {
  const { undoManager } = useUndoManager();
  const { clipboard } = useAudioEngine();

  return [
    {
      label: "Select all",
      onClick: () =>
        undoManager.withGroup("SELECT ALL NOTES", () => {
          clip.selectAllNotes();
        }),
      icon: SelectAllIcon,
    },
    {
      label: "Copy",
      onClick: () => clipboard.copy(clip.selectedNotes),
      icon: CopyIcon,
      disabled: clip.selectedNotes.length === 0,
    },
    {
      label: "Paste",
      onClick: () => pasteNotes(clipboard, clip, undoManager),
      icon: PasteIcon,
      disabled: clipboard.getNotes().length === 0,
    },
    {
      label: "Delete",
      onClick: () =>
        undoManager.withGroup("DELETE SELECTED NOTES", () => {
          clip.deleteSelectedNotes();
        }),
      disabled: clip.selectedNotes.length < 1,
      icon: DeleteIcon,
    },
    { separator: true },
    {
      label: "Quantize Full Note",
      onClick: () =>
        undoManager.withGroup("QUANTIZE NOTE OFF", () => {
          clip.quantizeSelectedNotes();
        }),
      disabled: clip.selectedNotes.length < 1,
      icon: QuantizeFullNoteIcon,
    },
    {
      label: "Quantize Start",
      onClick: () =>
        undoManager.withGroup("QUANTIZE NOTE ON", () => {
          clip.quantizeSelectedOn();
        }),
      disabled: clip.selectedNotes.length < 1,
      icon: QuantizeStartIcon,
    },
    {
      label: "Quantize End",
      onClick: () =>
        undoManager.withGroup("QUANTIZE NOTE OFF", () => {
          clip.quantizeSelectedOff();
        }),
      disabled: clip.selectedNotes.length < 1,
      icon: QuantizeEndIcon,
    },
  ];
};
