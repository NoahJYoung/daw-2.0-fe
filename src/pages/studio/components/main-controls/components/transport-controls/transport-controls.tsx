import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { FaStop, FaPlay } from "react-icons/fa";
import { FaCircle } from "react-icons/fa6";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";

const transportButtonClassName = `cursor-pointer rounded-xxs text-xl relative flex items-center justify-centers p-1 w-12 h-10 bg-surface-2 text-surface-5 hover:bg-surface-3`;
const buttonOnClassName = "bg-surface-2 text-surface-7";

export const TransportControls = observer(() => {
  const audioEngine = useAudioEngine();
  const { undoManager } = useUndoManager();

  const play = useCallback(() => {
    undoManager.withoutUndo(() => {
      audioEngine.play();
    });
  }, [audioEngine, undoManager]);

  const stop = useCallback(() => {
    undoManager.withoutUndo(() => {
      audioEngine.stop();
    });
  }, [audioEngine, undoManager]);

  const pause = useCallback(() => {
    undoManager.withoutUndo(() => {
      audioEngine.pause();
    });
  }, [audioEngine, undoManager]);

  const record = useCallback(() => {
    undoManager.withGroup("RECORD", () => {
      audioEngine.record();
    });
  }, [audioEngine, undoManager]);

  const { playDisabled } = audioEngine;

  return (
    <span
      className="flex h-full bg-surface-mid border-surface-mid border"
      style={{ gap: 1 }}
    >
      <StudioButton
        on={audioEngine.state === AudioEngineState.playing}
        onClassName={buttonOnClassName}
        onClick={play}
        disabled={playDisabled}
        className={transportButtonClassName}
        icon={FaPlay}
      />

      <StudioButton
        on={
          audioEngine.state === AudioEngineState.stopped ||
          audioEngine.state === AudioEngineState.paused
        }
        onClassName={buttonOnClassName}
        onClick={audioEngine.state === AudioEngineState.paused ? stop : pause}
        className={transportButtonClassName}
        icon={FaStop}
      />
      <StudioButton
        on={audioEngine.state === AudioEngineState.recording}
        onClassName={buttonOnClassName}
        onClick={record}
        disabled={playDisabled}
        className={transportButtonClassName}
        icon={FaCircle}
      />
    </span>
  );
});
