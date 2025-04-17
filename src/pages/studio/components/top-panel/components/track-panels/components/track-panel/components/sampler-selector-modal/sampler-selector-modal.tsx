import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { IconType } from "react-icons/lib";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { isMobileDevice } from "@/pages/studio/utils";
import { useMemo, useState } from "react";
import { Loader } from "@/pages/studio/components/loader";
import { useDeferredUpdate } from "@/pages/studio/hooks";
import { FaGuitar } from "react-icons/fa6";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
interface SamplerSelectorModalProps {
  track: Track;
  triggerIcon: IconType;
  triggerClassName: string;
}

export const SamplerSelectorModal = observer(
  ({ track, triggerClassName, triggerIcon }: SamplerSelectorModalProps) => {
    const grandPianoPath = "/sounds/samples/grand_piano/grand_piano.zip";
    const instruments = useMemo(
      () => [{ name: "Grand Piano", path: grandPianoPath }],
      []
    );

    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
      instruments?.[0].path || null
    );

    const { outputGain } = track.sampler;

    const {
      onValueChange: onOutputGainChange,
      onValueCommit: onOutputGainCommit,
    } = useDeferredUpdate<number>(track.sampler.outputGain, (value: number) =>
      track.sampler.setOutputGain(value)
    );

    const options = instruments.map(
      (instrument: { name: string; path: string }) => ({
        label: instrument.name,
        value: instrument.path,
      })
    );

    const loading = track.sampler.loading;
    const imgUrl = track.sampler.imgUrl;

    return (
      <StudioDialog
        title={isMobileDevice() ? "" : `${track.name} - ${"Sampler"}`}
        triggerIcon={triggerIcon}
        triggerClassName={triggerClassName}
      >
        <div className="overflow-auto w-full h-full flex flex-col gap-2 align-center justify-center py-2">
          <div className="flex items-center justify-center w-full">
            <StudioDropdown
              style={{ width: 300 }}
              options={options}
              value={selectedInstrument}
              placeholder="Instruments"
              disabled={options.length < 1 || loading}
              icon={<FaGuitar />}
              onChange={(instrument) => setSelectedInstrument(instrument)}
              colorOffset={1}
            />
          </div>
          <div className="flex w-full h-full justify-center items-center">
            {loading ? (
              <span className="flex flex-col items-center justify-center gap-4 h-full">
                <Loader
                  height={100}
                  color="#444"
                  global={false}
                  borderRadius="8px"
                  barCount={300 / 12}
                />
                <span className="text-surface-6">Loading...</span>
              </span>
            ) : (
              <div className="flex flex-col w-full h-full sm:flex-row items-center justify-evenly gap-4">
                {imgUrl ? (
                  <div className="w-[250px]">
                    <img
                      className="w-[250px] h-[250px] rounded-md"
                      src={imgUrl}
                      alt="Instrument Image"
                    />
                  </div>
                ) : (
                  <span>No cover image</span>
                )}
                <div className="flex flex-col gap-2">
                  <h4>Output Gain</h4>
                  <Knob
                    onValueChange={onOutputGainChange}
                    onValueCommit={onOutputGainCommit}
                    min={0}
                    max={1}
                    step={0.01}
                    value={outputGain}
                    size={64}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </StudioDialog>
    );
  }
);
