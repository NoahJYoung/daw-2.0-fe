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

      const radius = Math.min(Math.max(noteHeight * 0.25, 0.5), noteHeight / 2);

      if (noteHeight <= 1) {
        ctx.fillRect(x, y, width, noteHeight);
      } else {
        ctx.beginPath();

        if (width > radius * 2) {
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + noteHeight - radius);
          ctx.quadraticCurveTo(
            x + width,
            y + noteHeight,
            x + width - radius,
            y + noteHeight
          );
          ctx.lineTo(x + radius, y + noteHeight);
          ctx.quadraticCurveTo(x, y + noteHeight, x, y + noteHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
        } else {
          ctx.rect(x, y, width, noteHeight);
        }

        ctx.closePath();
        ctx.fill();
      }
    });
  }, [clip.events, timeline, noteHeight, clipWidth, clipHeight]);

  return clip.loading ? (
    <span
      style={{
        width: clipWidth,
        height: clipHeight,
        marginBottom: "6px",
      }}
    >
      <Loader
        height={clipHeight / 2}
        color="#444"
        global={false}
        borderRadius="8px"
        barCount={clipWidth / 12}
      />
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
