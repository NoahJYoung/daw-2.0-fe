import { PiSelectionAllThin as SelectAllIcon } from "react-icons/pi";
import { IoMdAdd as PlusIcon } from "react-icons/io";
import { FiDelete as DeleteIcon } from "react-icons/fi";
import { AudioEngine } from "@/pages/studio/audio-engine";
import { UndoManager } from "mobx-keystone";
import { selectAllTracks } from "../select-all-tracks";
import { deleteSelectedTracks } from "../delete-selected-tracks";

export const getTracksContextMenuActions = (
  audioEngine: AudioEngine,
  undoManager: UndoManager
) => {
  const { mixer } = audioEngine;

  return [
    {
      label: "Select all",
      onClick: () => selectAllTracks(mixer, undoManager),
      icon: SelectAllIcon,
      shortcut: "ctrl+shift+a",
    },
    {
      label: "Create Track",
      onClick: () => mixer.createTrack(),
      icon: PlusIcon,
      shortcut: "shift+t",
    },
    {
      label: "Delete",
      onClick: () => deleteSelectedTracks(mixer, undoManager),
      disabled: mixer.selectedTracks.length < 1,
      icon: DeleteIcon,
      shortcut: "shift+delete",
    },
  ];
};
