import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { useUndoManager } from "@/pages/studio/hooks";
import * as d3 from "d3";
import { observer } from "mobx-react-lite";
import { EffectViewProps } from "../../../../types";
import { generateEQCurvePoints } from "../../helpers";
import { Point } from "../../types";
import { CenterFrequency } from "../center-frequency";
import { EQGrid } from "../eq-grid";
import { FFTVisualizer } from "../fft-visualizer";
import { topHeight, topWidth } from "../../../../helpers";

const MIN_HERTZ = 20;
const MAX_HERTZ = 20000;

export const GraphicEQTopView = observer(
  ({ effect: graphicEQ, track }: EffectViewProps<GraphicEQ>) => {
    const { undoManager } = useUndoManager();

    const handleTabChange = (id: string) => {
      undoManager.withoutUndo(() => {
        graphicEQ.setSelectedBandId(id);
      });
    };

    const { bands } = graphicEQ;
    const newCurvePoints = generateEQCurvePoints(bands);
    const scaleY = d3
      .scaleLinear()
      .domain([-12, 12])
      .range([topHeight - 20, 0]);

    const scaleX = d3
      .scaleLog()
      .domain([MIN_HERTZ, MAX_HERTZ])
      .range([20, topWidth - 10]);

    const lineGenerator = d3
      .line<Point>()
      .x((band) => scaleX(band.frequency))
      .y((band) => scaleY(band.gain))
      .curve(d3.curveBumpX);

    const combinedCurvePath = lineGenerator(newCurvePoints);
    const [r, g, b] = track.rgb;

    const fill = `rgba(${r}, ${g}, ${b}, 0.4)`;
    const stroke = `rgba(${r}, ${g}, ${b}, 0.1)`;
    const rgbColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <>
        <FFTVisualizer
          graphicEQ={graphicEQ}
          width={topWidth - 20}
          height={topHeight - 20}
        />
        <svg
          width={topWidth}
          height={topHeight}
          style={{ borderRadius: "6px" }}
        >
          <EQGrid
            scaleY={scaleY}
            scaleX={scaleX}
            width={topWidth}
            height={topHeight}
          />

          {combinedCurvePath && (
            <path d={combinedCurvePath} fill={fill} stroke={stroke} />
          )}

          {bands.map((band, i) => (
            <CenterFrequency
              range={[MIN_HERTZ, MAX_HERTZ]}
              onClick={() => handleTabChange(band.id)}
              scaleX={scaleX}
              scaleY={scaleY}
              rgbColor={rgbColor}
              selected={graphicEQ.selectedBandId === band.id}
              band={band}
              key={i}
            />
          ))}
        </svg>
      </>
    );
  }
);
