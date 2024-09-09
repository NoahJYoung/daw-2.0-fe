import { useAudioEngine } from "@/pages/studio/hooks";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { FaStop, FaPlay } from "react-icons/fa";
import { FaCircle } from "react-icons/fa6";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { observer } from "mobx-react-lite";

const transportButtonClassName = `cursor-pointer rounded-xxs text-xl relative flex items-center justify-centers p-1 w-12 h-10 bg-surface-2 text-surface-5 hover:bg-surface-3`;
const buttonOnClassName = "bg-surface-2 text-surface-7";

export const TransportControls = observer(() => {
  const audioEngine = useAudioEngine();

  return (
    <span
      className="flex h-full bg-surface-1 border-surface-1 border"
      style={{ gap: 1 }}
    >
      <StudioButton
        on={audioEngine.state === AudioEngineState.playing}
        onClassName={buttonOnClassName}
        onClick={audioEngine.play}
        className={transportButtonClassName}
        icon={FaPlay}
      />

      <StudioButton
        on={
          audioEngine.state === AudioEngineState.stopped ||
          audioEngine.state === AudioEngineState.paused
        }
        onClassName={buttonOnClassName}
        onClick={
          audioEngine.state === AudioEngineState.paused
            ? audioEngine.stop
            : audioEngine.pause
        }
        className={transportButtonClassName}
        icon={FaStop}
      />
      <StudioButton
        on={audioEngine.state === AudioEngineState.recording}
        onClassName={buttonOnClassName}
        onClick={audioEngine.record}
        className={transportButtonClassName}
        icon={FaCircle}
      />
    </span>
  );
});
