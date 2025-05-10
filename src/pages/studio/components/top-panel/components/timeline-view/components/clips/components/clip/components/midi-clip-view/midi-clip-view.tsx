import { MidiClip, Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useRef, useEffect } from "react";
import {
  getNoteWidth,
  getNoteXPosition,
  getNoteYPosition,
} from "../../helpers";
import { Loader } from "@/pages/studio/components/loader";

interface MidiClipViewProps {
  clip: MidiClip;
  track: Track;
}

export const MidiClipView = observer(({ clip, track }: MidiClipViewProps) => {
  const { timeline } = useAudioEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const noteHeight = (track.laneHeight - 36 - 20) / 12;
  const clipWidth = timeline.samplesToPixels(clip.length);
  const clipHeight = track.laneHeight - 30;

  const pitches = clip.events.map((event) => event.note).join(",");

  const starts = clip.events.map((event) => event.on).join(",");

  const ends = clip.events.map((event) => event.off).join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = clipWidth * dpr;
    canvas.height = clipHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, clipWidth, clipHeight);

    clip.events.forEach((event) => {
      const x = getNoteXPosition(event, timeline);
      const y = getNoteYPosition(event, noteHeight);
      const width = getNoteWidth(event, timeline);

      ctx.fillStyle = "black";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 0.5;

      if (noteHeight <= 1) {
        ctx.strokeRect(x, y, width, noteHeight);
        ctx.fillRect(x, y, width, noteHeight);
      } else {
        ctx.beginPath();
        ctx.rect(x, y, width, noteHeight);
        ctx.closePath();

        ctx.fill();

        ctx.stroke();
      }
    });
  }, [
    clip.events,
    timeline,
    noteHeight,
    clipWidth,
    clipHeight,
    pitches,
    starts,
    ends,
  ]);

  return clip.loading ? (
    <span
      style={{
        width: clipWidth,
        height: clipHeight,
        marginBottom: "6px",
      }}
    >
      <Loader />
    </span>
  ) : (
    <canvas
      ref={canvasRef}
      style={{
        width: clipWidth,
        height: clipHeight,
        marginBottom: "6px",
      }}
      className="mb-[6px]"
    />
  );
});
