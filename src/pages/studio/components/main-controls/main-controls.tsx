import { observer } from "mobx-react-lite";
import { useAudioEngine, useRequestAnimationFrame } from "../../hooks";
import { TransportControls, TransportPosition } from "./components";
import * as Tone from "tone";
import { useEffect, useState } from "react";
import { AudioEngineState } from "../../audio-engine/types";

export const MainControls = observer(() => {
  const { state, timeline } = useAudioEngine();

  const [transportPosition, setTransportPosition] = useState<string>(
    Tone.Time(Tone.getTransport().seconds, "s").toBarsBeatsSixteenths()
  );

  useRequestAnimationFrame(
    () => {
      setTransportPosition(
        Tone.Time(Tone.getTransport().seconds, "s").toBarsBeatsSixteenths()
      );
    },
    {
      enabled:
        state === AudioEngineState.playing ||
        state === AudioEngineState.recording,
    }
  );

  useEffect(() => {
    setTransportPosition(
      Tone.Time(Tone.getTransport().seconds, "s").toBarsBeatsSixteenths()
    );
  }, [timeline.positionInSamples]);

  return (
    <>
      <TransportControls />
      <TransportPosition position={transportPosition} />
    </>
  );
});
