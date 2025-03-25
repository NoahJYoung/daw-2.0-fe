import {
  AiOutlineSplitCells as SplitIcon,
  AiOutlineMergeCells as JoinIcon,
} from "react-icons/ai";
import { FiDelete as DeleteIcon } from "react-icons/fi";
import { PiWaveformBold as AudioIcon } from "react-icons/pi";
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
import { AudioClip, MidiClip } from "@/pages/studio/audio-engine/components";

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
    { separator: true },
    {
      label: "Convert to audio",
      disabled:
        mixer.selectedClips.length !== 1 ||
        mixer.selectedClips?.[0]?.type !== "midi",
      onClick: () => {
        undoManager.withGroup(async () => {
          audioEngine.setPlayDisabled(true);
          await (mixer.selectedClips[0] as MidiClip).convertToAudioClip();
          audioEngine.setPlayDisabled(false);
        });
      },
      icon: AudioIcon,
    },
    {
      label: "Convert to midi",
      disabled:
        mixer.selectedClips.length !== 1 ||
        mixer.selectedClips?.[0]?.type !== "audio" ||
        !(mixer.selectedClips[0] as AudioClip).canConvertToMidi,

      onClick: () =>
        undoManager.withGroup(() =>
          (mixer.selectedClips[0] as AudioClip).convertToMidiClip()
        ),
      icon: MidiIcon,
    },
  ];
};
