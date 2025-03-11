import { useHotkeys } from "react-hotkeys-hook";
import { useAudioEngine, useUndoManager } from "../../hooks";
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

export const HotKeysManager = observer(() => {
  const { undoManager } = useUndoManager();
  const audioEngine = useAudioEngine();
  const { mixer, clipboard, timeline } = audioEngine;
  const { toast } = useToast();

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
    deleteSelectedClips(mixer, undoManager);
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
    pasteClips(clipboard, mixer, timeline, undoManager);
  });

  useHotkeys("ctrl+shift+a", (event) => {
    event.preventDefault();
    selectAllTracks(mixer, undoManager);
  });

  useHotkeys("shift+delete", (event) => {
    event.preventDefault();
    deleteSelectedTracks(mixer, undoManager);
  });

  return null;
});
