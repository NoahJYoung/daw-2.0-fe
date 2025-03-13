import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject, EffectViewProps } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { observer } from "mobx-react-lite";
import { BandControls, CenterFrequency, EQGrid } from "./components";
import * as d3 from "d3";
import { Point } from "./types";
import { generateEQCurvePoints, getBandIcon } from "./helpers";
import { useUndoManager } from "@/pages/studio/hooks";
import { useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { cn } from "@/lib/utils";

const MIN_HERTZ = 20;
const MAX_HERTZ = 20000;
const MAX_BANDS = 10;

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
    const newCurvePoints = generateEQCurvePoints(bands);
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

    const combinedCurvePath = lineGenerator(newCurvePoints);
    const [r, g, b] = track.rgb;

    const fill = `rgba(${r}, ${g}, ${b}, 0.4)`;
    const stroke = `rgba(${r}, ${g}, ${b}, 0.1)`;
    const rgbColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <>
        <svg width={width} height={height} style={{ borderRadius: "6px" }}>
          <EQGrid
            scaleY={scaleY}
            scaleX={scaleX}
            width={width}
            height={height}
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

const GraphicEQBottomView = observer(
  ({ effect, track }: EffectViewProps<GraphicEQ>) => {
    const { undoManager } = useUndoManager();

    const handleTabChange = (id: string) => {
      undoManager.withoutUndo(() => {
        effect.setSelectedBandId(id);
      });
    };

    const createBand = () => {
      if (effect.bands.length >= MAX_BANDS) {
        return;
      }
      undoManager.withGroup("CREATE BAND", () => {
        effect.createBand();
      });
    };

    const deleteBand = () => {
      undoManager.withGroup("DELETE BAND", () => {
        effect.removeSelectedBand();
      });
    };

    useEffect(() => {
      if (!effect.selectedBand && effect.bands[0]) {
        effect.setSelectedBandId(effect.bands[0].id);
      }
    }, [effect]);

    const triggerClassName = "hover:opacity-50 shadow-none";

    const [r, g, b] = track.rgb;
    const rgbColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <div className="flex flex-col gap-1 h-full w-full">
        <Tabs
          value={effect.selectedBandId}
          onValueChange={handleTabChange}
          defaultValue={effect.bands[0].id}
        >
          <div className="flex algin-items-center w-full justify-between">
            <TabsList className="flex gap-2 align-items-center flex-wrap">
              {effect.bands.map((band, i) => (
                <TabsTrigger
                  className={triggerClassName}
                  key={band.id}
                  value={band.id}
                >
                  {getBandIcon(band, track, i, effect.selectedBandId)}
                </TabsTrigger>
              ))}
            </TabsList>

            <span className="flex align-items-center gap">
              {effect.bands.length < MAX_BANDS && (
                <StudioButton
                  disabled={effect.bands.length >= MAX_BANDS}
                  className={cn(
                    triggerClassName,
                    "h-6 w-6 m-0 flex items-center justify-center bg-transparent hover:bg-transparent"
                  )}
                  onClick={createBand}
                  style={{ color: rgbColor }}
                  size="sm"
                  icon={() => <FaPlus className="flex-shrink-0" />}
                />
              )}

              <StudioButton
                disabled={effect.selectedBand?.type !== "peaking"}
                className={cn(
                  triggerClassName,
                  "h-6 w-6 m-0 flex items-center justify-center bg-transparent hover:bg-transparent"
                )}
                onClick={deleteBand}
                style={{ color: rgbColor }}
                size="sm"
                icon={() => <FaTrash className="flex-shrink-0" />}
              />
            </span>
          </div>

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
