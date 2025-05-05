import { useHotkeys } from "react-hotkeys-hook";
import {
  useAudioEngine,
  useBottomPanelViewController,
  useUndoManager,
} from "../../hooks";
import { useToast } from "@/components/ui/use-toast";
import { observer } from "mobx-react-lite";
import {
  splitSelectedClips,
  joinClips,
  deleteSelectedClips,
  selectAllClips,
  pasteClips,
} from "../top-panel/components/timeline-view/components/clips/helpers";
import {
  deleteSelectedTracks,
  selectAllTracks,
} from "../top-panel/components/track-panels/helpers";
import { AudioClip, MidiClip } from "../../audio-engine/components";

export const HotKeysManager = observer(() => {
  const { undoManager } = useUndoManager();
  const audioEngine = useAudioEngine();
  const { mixer, clipboard, timeline } = audioEngine;
  const { toast } = useToast();
  const { bottomPanelRef } = useBottomPanelViewController();

  useHotkeys("ctrl+z", (event) => {
    event.preventDefault();
    if (undoManager.canUndo) {
      undoManager.undo();
    }
  });

  useHotkeys("ctrl+shift+z", (event) => {
    event.preventDefault();
    if (undoManager.canRedo) {
      undoManager.redo();
    }
  });

  useHotkeys("shift+add", (event) => {
    event.preventDefault();
    undoManager.withoutUndo(() => {
      event.preventDefault();
      audioEngine.timeline.zoomIn();
    });
  });

  useHotkeys("shift+subtract", (event) => {
    event.preventDefault();
    undoManager.withoutUndo(() => {
      event.preventDefault();
      audioEngine.timeline.zoomOut();
    });
  });

  useHotkeys("shift+t", (event) => {
    event.preventDefault();
    audioEngine.mixer.createTrack();
  });

  useHotkeys("shift+r", (event) => {
    event.preventDefault();
    undoManager.withoutUndo(() => {
      audioEngine.record();
    });
  });

  const sameParentTrack =
    mixer.selectedClips.length &&
    mixer.selectedClips.every(
      (selectedClip) => selectedClip.trackId === mixer.selectedClips[0].trackId
    );

  useHotkeys("shift+s", (event) => {
    event.preventDefault();
    splitSelectedClips(mixer, timeline, undoManager);
  });

  useHotkeys("shift+j", (event) => {
    event.preventDefault();
    joinClips(mixer, undoManager);
  });

  useHotkeys("delete", (event) => {
    event.preventDefault();
    const shouldDeleteTracks =
      mixer.selectedTracks.length >= 1 &&
      mixer.selectedClips.length === 0 &&
      (!((bottomPanelRef.current?.getSize() || 0) > 30) ||
        !mixer.featuredClip ||
        mixer.featuredClip instanceof AudioClip ||
        mixer.featuredClip.selectedNotes.length === 0);

    const shouldDeleteClips =
      mixer.selectedClips.length >= 1 &&
      mixer.selectedTracks.length === 0 &&
      (!((bottomPanelRef.current?.getSize() || 0) > 30) ||
        !mixer.featuredClip ||
        mixer.featuredClip instanceof AudioClip ||
        mixer.featuredClip.selectedNotes.length === 0);

    const shouldDeleteNotes =
      mixer.panelMode === "PIANO_ROLL" &&
      (bottomPanelRef.current?.getSize() || 0) > 30 &&
      mixer.featuredClip &&
      mixer.featuredClip instanceof MidiClip &&
      mixer.featuredClip.selectedNotes.length >= 0;

    if (shouldDeleteClips) {
      deleteSelectedClips(mixer, undoManager);
    } else if (shouldDeleteTracks) {
      deleteSelectedTracks(mixer, undoManager);
    } else if (shouldDeleteNotes) {
      undoManager.withGroup("DELETE SELECTED NOTES", () => {
        (mixer.featuredClip as MidiClip)?.deleteSelectedNotes();
      });
    }
  });

  useHotkeys("ctrl+a", (event) => {
    event.preventDefault();
    selectAllClips(mixer, undoManager);
  });

  useHotkeys("ctrl+c", (event) => {
    if (sameParentTrack) {
      event.preventDefault();
      clipboard.copy(mixer.selectedClips);
    } else {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Can't copy clips from different tracks",
      });
    }
  });

  useHotkeys("ctrl+v", (event) => {
    event.preventDefault();
    pasteClips(clipboard, mixer, undoManager);
  });

  useHotkeys("ctrl+shift+a", (event) => {
    event.preventDefault();
    selectAllTracks(mixer, undoManager);
  });

  useHotkeys("shift+delete", (event) => {
    event.preventDefault();
    deleteSelectedTracks(mixer, undoManager);
  });

  // TODO: Remove this after debugging/testing of undo manager
  useHotkeys("shift+i", () => {
    console.log(undoManager.undoQueue[undoManager.undoQueue.length - 1]);
  });

  return null;
});
