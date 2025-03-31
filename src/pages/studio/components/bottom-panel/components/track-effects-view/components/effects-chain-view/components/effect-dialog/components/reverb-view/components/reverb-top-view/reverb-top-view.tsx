import { observer } from "mobx-react-lite";
import { EffectViewProps } from "../../../../types";
import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { topHeight, topWidth } from "../../../../helpers";
import { isMobileDevice } from "@/pages/studio/utils";

export const ReverbTopView = observer(
  ({ effect: reverb, track }: EffectViewProps<Reverb>) => {
    const { decay, wet, preDelay } = reverb;
    const [r, g, b] = track.rgb;
    const trackColor = `rgb(${r}, ${g}, ${b})`;

    const padding = isMobileDevice() ? 15 : 20;

    const preDelayMultiplier = 0.2 * preDelay;

    const effectiveWidth = topWidth - 2 * padding;
    const effectiveHeight = topHeight - 2 * padding;
    const preDelayWidth = effectiveWidth * preDelayMultiplier;

    const generateCurvePoints = () => {
      const points = [];

      points.push(`${padding + preDelayWidth},${padding}`);

      const numPoints = 100;

      for (let i = 0; i <= numPoints; i++) {
        const x =
          padding +
          preDelayWidth +
          (effectiveWidth - preDelayWidth) * (i / numPoints);

        const t = (i / numPoints) * 8;
        const decayFactor = Math.exp(-t / decay);

        const y = padding + effectiveHeight * (1 - decayFactor);
        points.push(`${x},${y}`);
      }

      return points.join(" ");
    };

    const generateFillArea = () => {
      const points = [];

      points.push(`${padding},${topHeight - padding}`);

      points.push(`${padding + preDelayWidth},${topHeight - padding}`);
      points.push(`${padding + preDelayWidth},${padding}`);

      const numPoints = 100;
      for (let i = 0; i <= numPoints; i++) {
        const x =
          padding +
          preDelayWidth +
          (effectiveWidth - preDelayWidth) * (i / numPoints);
        const t = (i / numPoints) * 8;
        const decayFactor = Math.exp(-t / decay);
        const y = padding + effectiveHeight * (1 - decayFactor);
        points.push(`${x},${y}`);
      }

      points.push(`${topWidth - padding},${topHeight - padding}`);

      return points.join(" ");
    };

    return (
      <div
        className="bg-surface-0 flex justify-center items-center"
        style={{ borderRadius: "6px", width: topWidth, height: topHeight }}
      >
        <svg
          width={topWidth - 2}
          height={topHeight - 2}
          className="bg-surface-0 shadow-md"
        >
          <g className="grid-lines">
            {[...Array(6)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1={padding}
                y1={padding + ((topHeight - 2 * padding) * i) / 5}
                x2={topWidth - padding}
                y2={padding + ((topHeight - 2 * padding) * i) / 5}
                stroke="#888"
                strokeWidth="0.5"
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={padding + ((topWidth - 2 * padding) * i) / 5}
                y1={padding}
                x2={padding + ((topWidth - 2 * padding) * i) / 5}
                y2={topHeight - padding}
                stroke="#888"
                strokeWidth="0.5"
              />
            ))}
          </g>

          <defs>
            <linearGradient id="wetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={trackColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={trackColor} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          <polygon
            points={generateFillArea()}
            fill="url(#wetGradient)"
            strokeWidth={1}
            opacity={0.1 + wet * 0.9}
          />

          <line
            x1={padding}
            y1={topHeight - padding}
            x2={topWidth - padding}
            y2={topHeight - padding}
            stroke="#888"
            strokeWidth="0.5"
          />

          <polyline
            points={generateCurvePoints()}
            fill="none"
            stroke={trackColor}
            strokeWidth="1"
            opacity={1 - wet}
            strokeLinecap="round"
          />

          <text
            x={padding + 8}
            y={topHeight - padding / 2 + 4}
            fontSize="12"
            fill="#888"
            textAnchor="middle"
          >
            0s
          </text>
          <text
            x={topWidth - padding - 8}
            y={topHeight - padding / 2 + 4}
            fontSize="12"
            fill="#888"
            textAnchor="middle"
          >
            5s
          </text>

          {[0, 1, 2, 3, 4, 5, 6].map((tick) => {
            const x = padding + ((topWidth - 2 * padding) * tick) / 5;
            return (
              <line
                key={`tick-${tick}`}
                x1={x}
                y1={topHeight - padding}
                x2={x}
                y2={topHeight - padding + 5}
                stroke="#888"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>
    );
  }
);
