import { useHotkeys } from "react-hotkeys-hook";
import { observer } from "mobx-react-lite";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import {
  deleteSelectedClips,
  selectAllClips,
  splitSelectedClips,
} from "../clips/helpers";

export const TimelineHotKeysManager = observer(() => {
  const undoManager = useUndoManager();
  const { mixer, timeline } = useAudioEngine();

  useHotkeys("shift+s", (event) => {
    event.preventDefault();
    splitSelectedClips(mixer, timeline, undoManager);
  });

  useHotkeys("delete", (event) => {
    event.preventDefault();
    deleteSelectedClips(mixer, undoManager);
  });

  useHotkeys("ctrl+a", (event) => {
    event.preventDefault();
    selectAllClips(mixer, undoManager);
  });

  return null;
});
