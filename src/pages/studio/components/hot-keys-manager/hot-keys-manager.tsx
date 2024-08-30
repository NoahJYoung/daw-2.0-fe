import { useHotkeys } from "react-hotkeys-hook";
import { useAudioEngine, useUndoManager } from "../../hooks";
import { useToast } from "@/components/ui/use-toast";
import { observer } from "mobx-react-lite";

export const HotKeysManager = observer(() => {
  const undoManager = useUndoManager();
  const audioEngine = useAudioEngine();
  const { toast } = useToast();

  useHotkeys("ctrl+z", (event) => {
    event.preventDefault();
    if (undoManager.canUndo) {
      undoManager.undo();
    } else {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Can't undo",
      });
    }
  });

  useHotkeys("ctrl+shift+z", (event) => {
    event.preventDefault();
    if (undoManager.canRedo) {
      undoManager.redo();
    } else {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Can't redo",
      });
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

  return null;
});
