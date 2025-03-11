import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject, EffectViewProps } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { observer } from "mobx-react-lite";
import { BandControls, CenterFrequency, EQGrid } from "./components";
import * as d3 from "d3";
import { Point } from "./types";
import { getBandIcon, getCurvePoints } from "./helpers";
import { useUndoManager } from "@/pages/studio/hooks";
import { useEffect } from "react";

const MIN_HERTZ = 20;
const MAX_HERTZ = 20000;

const GraphicEQTopView = observer(
  ({ effect: graphicEQ, track }: EffectViewProps<GraphicEQ>) => {
    const { undoManager } = useUndoManager();

    const handleTabChange = (id: string) => {
      undoManager.withoutUndo(() => {
        graphicEQ.setSelectedBandId(id);
      });
    };

    const [width, height] = [484, 155];
    const { bands } = graphicEQ;
    const curvePoints = getCurvePoints(bands);
    const scaleY = d3
      .scaleLinear()
      .domain([-12, 12])
      .range([height - 20, 0]);

    const scaleX = d3
      .scaleLog()
      .domain([MIN_HERTZ, MAX_HERTZ])
      .range([20, width - 10]);

    const lineGenerator = d3
      .line<Point>()
      .x((band) => scaleX(band.frequency))
      .y((band) => scaleY(band.gain))
      .curve(d3.curveBumpX);

    const combinedCurvePath = lineGenerator(curvePoints);
    const [r, g, b] = track.rgb;

    const fill = `rgba(${r}, ${g}, ${b}, 0.4)`;
    const stroke = `rgba(${r}, ${g}, ${b}, 0.1)`;

    return (
      <svg width={width} height={height} style={{ borderRadius: "6px" }}>
        <EQGrid scaleY={scaleY} scaleX={scaleX} width={width} height={height} />

        {combinedCurvePath && (
          <path d={combinedCurvePath} fill={fill} stroke={stroke} />
        )}

        {bands.map((band, i) => (
          <CenterFrequency
            range={[MIN_HERTZ, MAX_HERTZ]}
            onClick={() => handleTabChange(band.id)}
            scaleX={scaleX}
            scaleY={scaleY}
            band={band}
            key={i}
          />
        ))}
      </svg>
    );
  }
);

const GraphicEQBottomView = observer(
  ({ effect, track }: EffectViewProps<GraphicEQ>) => {
    const { undoManager } = useUndoManager();

    const handleTabChange = (id: string) => {
      undoManager.withoutUndo(() => {
        effect.setSelectedBandId(id);
      });
    };

    useEffect(() => {
      if (!effect.selectedBand && effect.bands[0]) {
        effect.setSelectedBandId(effect.bands[0].id);
      }
    }, [effect]);

    return (
      <div className="flex flex-col gap-1 h-full w-full">
        <Tabs
          value={effect.selectedBandId}
          onValueChange={handleTabChange}
          defaultValue={effect.bands[0].id}
        >
          <TabsList className="flex gap-2">
            {effect.bands.map((band, i) => (
              <TabsTrigger className="text-sm" key={band.id} value={band.id}>
                {getBandIcon(band, track, i, effect.selectedBandId)}
              </TabsTrigger>
            ))}
            <TabsTrigger onClick={() => effect.createBand()} value={"null"}>
              +
            </TabsTrigger>
          </TabsList>
          {effect.bands.map((band) => (
            <TabsContent className="w-full" key={band.id} value={band.id}>
              <BandControls track={track} band={band} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }
);

export const GraphicEQView: EffectViewComponentObject<GraphicEQ> = {
  Upper: GraphicEQTopView,
  Lower: GraphicEQBottomView,
};
