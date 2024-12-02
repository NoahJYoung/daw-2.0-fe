import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject, EffectViewProps } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { observer } from "mobx-react-lite";
import { BandControls } from "./components";

const GraphicEQTopView = () => <div>Graphic EQ Top View</div>;

const GraphicEQBottomView = observer(
  ({ effect }: EffectViewProps<GraphicEQ>) => {
    return (
      <div className="flex flex-col gap-1 h-full w-full">
        <Tabs defaultValue={effect.bands[0].id}>
          <TabsList className="flex gap-2">
            {effect.bands.map((band) => (
              <TabsTrigger className="text-sm" key={band.id} value={band.id}>
                {band.name}
              </TabsTrigger>
            ))}
            <TabsTrigger onClick={() => effect.createBand()} value={"null"}>
              +
            </TabsTrigger>
          </TabsList>
          {effect.bands.map((band) => (
            <TabsContent className="w-full" key={band.id} value={band.id}>
              <BandControls band={band} />
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
