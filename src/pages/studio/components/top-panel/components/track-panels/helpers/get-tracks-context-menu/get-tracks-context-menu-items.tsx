import { PiSelectionAllThin as SelectAllIcon } from "react-icons/pi";
import { IoMdAdd as PlusIcon } from "react-icons/io";
import { FiDelete as DeleteIcon } from "react-icons/fi";
import { AudioEngine } from "@/pages/studio/audio-engine";
import { UndoManager } from "mobx-keystone";
import { selectAllTracks } from "../select-all-tracks";
import { IoColorPaletteSharp as ColorIcon } from "react-icons/io5";
import { deleteSelectedTracks } from "../delete-selected-tracks";
import { RgbColorPicker as ColorPicker } from "react-colorful";

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
    {
      separator: true,
    },
    {
      label: "Track Color",
      disabled: mixer.selectedTracks.length < 1,
      children: [
        {
          render: () => (
            <ColorPicker
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              color={
                mixer.selectedTracks.length
                  ? {
                      r: mixer.selectedTracks[0].rgb[0],
                      g: mixer.selectedTracks[0].rgb[1],
                      b: mixer.selectedTracks[0].rgb[2],
                    }
                  : { r: 175, g: 175, b: 175 }
              }
              onChange={(color) => {
                undoManager.withGroup("CHANGE TRACK COLORS", () => {
                  const { r, g, b } = color;
                  mixer.selectedTracks.forEach((track) =>
                    track.setRgb([r, g, b])
                  );
                });
              }}
            />
          ),
        },
      ],
      icon: ColorIcon,
    },
  ];
};
