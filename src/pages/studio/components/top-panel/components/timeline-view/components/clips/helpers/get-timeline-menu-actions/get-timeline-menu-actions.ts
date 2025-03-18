import {
  AiOutlineSplitCells as SplitIcon,
  AiOutlineMergeCells as JoinIcon,
} from "react-icons/ai";
import { FiDelete as DeleteIcon } from "react-icons/fi";
import { PiSelectionAllThin as SelectAllIcon } from "react-icons/pi";
import {
  MdContentPasteGo as PasteIcon,
  MdOutlineContentCopy as CopyIcon,
} from "react-icons/md";
import { BsFiletypeMp3 as ImportFileIcon } from "react-icons/bs";
import {
  createEmptyMidiClip,
  deleteSelectedClips,
  importFromFile,
  joinClips,
  pasteClips,
  selectAllClips,
  splitSelectedClips,
} from "..";
import { AudioEngine } from "@/pages/studio/audio-engine";
import { SiMidi as MidiIcon } from "react-icons/si";
import { UndoManager } from "mobx-keystone";

export const getTimelineMenuActions = (
  audioEngine: AudioEngine,
  undoManager: UndoManager
) => {
  const { mixer, clipboard, timeline } = audioEngine;

  const isSameParentTrack =
    mixer.selectedClips.length &&
    mixer.selectedClips.every(
      (selectedClip) => selectedClip.trackId === mixer.selectedClips[0].trackId
    );

  const isSameClipType =
    mixer.selectedClips.length &&
    mixer.selectedClips.every(
      (selectedClip) => selectedClip.type === mixer.selectedClips[0].type
    );

  return [
    {
      label: "Select all",
      onClick: () => selectAllClips(mixer, undoManager),
      icon: SelectAllIcon,
      shortcut: "ctrl+a",
    },
    {
      label: "Copy",
      onClick: () => clipboard.copy(mixer.selectedClips),
      icon: CopyIcon,
      disabled: mixer.selectedClips.length === 0 || !isSameParentTrack,
      shortcut: "ctrl+c",
    },
    {
      label: "Paste",
      onClick: () => pasteClips(clipboard, mixer, undoManager),
      icon: PasteIcon,
      disabled:
        clipboard.getClips().length === 0 || mixer.selectedTracks.length === 0,
      shortcut: "ctrl+v",
    },
    { separator: true },
    {
      label: "Split at playhead",
      onClick: () => splitSelectedClips(mixer, timeline, undoManager),
      icon: SplitIcon,
      disabled: mixer.selectedClips.length === 0,
      shortcut: "shift+s",
    },
    {
      label: "Join",
      onClick: () => joinClips(mixer, undoManager),
      icon: JoinIcon,
      disabled:
        mixer.selectedClips.length < 2 || !isSameParentTrack || !isSameClipType,
      shortcut: "shift+j",
    },

    {
      label: "Delete",
      onClick: () => deleteSelectedClips(mixer, undoManager),
      disabled: mixer.selectedClips.length < 1,
      icon: DeleteIcon,
      shortcut: "delete",
    },
    { separator: true },
    {
      label: "Import file",
      disabled: mixer.selectedTracks.length < 1,
      onClick: () => importFromFile(mixer.selectedTracks),
      icon: ImportFileIcon,
    },
    {
      label: "Create midi clip",
      disabled: mixer.selectedTracks.length < 1,
      onClick: () => createEmptyMidiClip(mixer),
      icon: MidiIcon,
    },
  ];
};
