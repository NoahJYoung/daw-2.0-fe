import { observer } from "mobx-react-lite";
import { useAudioEngine } from "../../hooks";
import { TransportControls, TransportPosition } from "./components";
import * as Tone from "tone";

export const MainControls = observer(() => {
  const { timeline } = useAudioEngine();

  const position = Tone.Time(timeline.seconds, "s").toBarsBeatsSixteenths();

  return (
    <div className="flex items-center gap-2">
      <TransportControls />
      <TransportPosition position={position} />
    </div>
  );
});
