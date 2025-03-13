import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { cn } from "@/lib/utils";
import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { useUndoManager } from "@/pages/studio/hooks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { EffectViewProps } from "../../../../types";
import { getBandIcon } from "../../helpers";
import { BandControls } from "../band-controls";

const MAX_BANDS = 10;

export const GraphicEQBottomView = observer(
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
