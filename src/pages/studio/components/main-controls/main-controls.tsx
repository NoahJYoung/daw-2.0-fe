import { observer } from "mobx-react-lite";
import { useAudioEngine, useRequestAnimationFrame } from "../../hooks";
import { TimelineControls, TransportControls } from "./components";
import * as Tone from "tone";
import { useEffect, useRef } from "react";
import { AudioEngineState } from "../../audio-engine/types";

export const MainControls = observer(() => {
  const { state, timeline } = useAudioEngine();

  const transportPositionRef = useRef<HTMLSpanElement>(null);

  const lastPositionRef = useRef(
    Tone.Time(Tone.getTransport().seconds, "s").toBarsBeatsSixteenths()
  );
  const lastUpdateTimeRef = useRef(0);
  const UPDATE_THRESHOLD_MS = 75;

  const updateTransportPosition = () => {
    if (!transportPositionRef.current) return;

    const now = performance.now();

    if (now - lastUpdateTimeRef.current < UPDATE_THRESHOLD_MS) {
      return;
    }

    const currentPosition = Tone.Time(
      Tone.getTransport().seconds,
      "s"
    ).toBarsBeatsSixteenths();

    if (currentPosition !== lastPositionRef.current) {
      lastPositionRef.current = currentPosition;
      lastUpdateTimeRef.current = now;

      transportPositionRef.current.textContent = currentPosition;
    }
  };

  useRequestAnimationFrame(updateTransportPosition, {
    enabled:
      state === AudioEngineState.playing ||
      state === AudioEngineState.recording,
  });

  useEffect(() => {
    if (
      state !== AudioEngineState.playing &&
      state !== AudioEngineState.recording
    ) {
      updateTransportPosition();
    }
  }, [timeline.positionInSamples, state]);

  const TransportPositionDisplay = () => (
    <div className="bg-transparent min-w-[120px] text-center justify-center text-surface-4 lg:mt-1 text-2xl">
      <span ref={transportPositionRef}>
        {Tone.Time(Tone.getTransport().seconds, "s").toBarsBeatsSixteenths()}
      </span>
    </div>
  );

  return (
    <>
      <TransportControls />
      <TransportPositionDisplay />
      <TimelineControls />
    </>
  );
});
