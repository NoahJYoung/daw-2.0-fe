import { useHotkeys } from "react-hotkeys-hook";
import { observer } from "mobx-react-lite";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import {
  deleteSelectedClips,
  joinClips,
  pasteClips,
  selectAllClips,
  splitSelectedClips,
} from "../clips/helpers";
import { useToast } from "@/components/ui/use-toast";

export const TimelineHotKeysManager = observer(() => {
  const { undoManager } = useUndoManager();
  const { toast } = useToast();
  const { mixer, timeline, clipboard } = useAudioEngine();

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
    pasteClips(clipboard, mixer, undoManager);
  });

  return null;
});
