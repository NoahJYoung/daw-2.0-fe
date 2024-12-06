import React from "react";
import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject, EffectViewProps } from "../../types";
import { observer } from "mobx-react-lite";

const ReverbTopView = () => <div>Reverb Top View</div>;

const ReverbBottomView = observer(
  ({ effect: reverb }: EffectViewProps<Reverb>) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        reverb.loadFile(objectUrl);
      }
    };

    return (
      <div className="flex flex-col gap-1 h-full w-full">
        <input type="file" onChange={handleFileChange} accept="audio/*" />
      </div>
    );
  }
);

export const ReverbView: EffectViewComponentObject<Reverb> = {
  Upper: ReverbTopView,
  Lower: ReverbBottomView,
};
