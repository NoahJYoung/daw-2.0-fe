import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { IconType } from "react-icons/lib";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { isMobileDevice } from "@/pages/studio/utils";
import { useMemo } from "react";
import { Loader } from "@/pages/studio/components/loader";
import { useDeferredUpdate } from "@/pages/studio/hooks";
import { FaGuitar } from "react-icons/fa6";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { NumberInput } from "@/pages/studio/components/bottom-panel/components/track-effects-view/components/effects-chain-view/components/effect-dialog/components/graphic-eq-view/components/band-controls/components";

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

    const { outputGain } = track.sampler;

    const {
      onValueChange: onOutputGainChange,
      onValueCommit: onOutputGainCommit,
    } = useDeferredUpdate<number>(track.sampler.outputGain, (value: number) =>
      track.sampler.setOutputGain(value)
    );

    const { onValueChange: onAttackChange, onValueCommit: onAttackCommit } =
      useDeferredUpdate<number>(track.sampler.attack, (value: number) =>
        track.sampler.setAttack(value)
      );

    const { onValueChange: onReleaseChange, onValueCommit: onReleaseCommit } =
      useDeferredUpdate<number>(track.sampler.release, (value: number) =>
        track.sampler.setRelease(value)
      );

    const options = [
      ...instruments.map((instrument: { name: string; path: string }) => ({
        label: instrument.name,
        value: instrument.path,
      })),
    ];

    const loading = track.sampler.loading;
    const imgUrl = track.sampler.imgUrl;
    const [r, g, b] = track.rgb;
    const trackColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <StudioDialog
        title={isMobileDevice() ? "" : `${track.name} - ${"Sampler"}`}
        triggerIcon={triggerIcon}
        triggerClassName={triggerClassName}
      >
        <div className="overflow-auto w-full h-full flex flex-col gap-2 align-center justify-center">
          <div className="flex items-center justify-center w-full">
            <StudioDropdown
              style={{ width: 300 }}
              options={options}
              value={track.sampler.samplePath}
              placeholder="Instruments"
              disabled={options.length < 1 || loading}
              icon={<FaGuitar />}
              onChange={(instrument) => track.sampler.setSamplePath(instrument)}
              colorOffset={1}
            />
          </div>
          {track.sampler?.samplePath ? (
            <div className="flex w-full h-full justify-center items-center">
              {loading ? (
                <span className="flex flex-col items-center justify-center gap-4 h-full">
                  <Loader />
                  <span className="text-surface-6">Loading...</span>
                </span>
              ) : (
                <div className="flex flex-col w-full h-full sm:flex-row items-center justify-evenly gap-2">
                  {imgUrl ? (
                    <div className="w-[250px]">
                      <img
                        className="w-[250px] h-[250px] rounded-md"
                        src={imgUrl}
                        alt="Instrument Image"
                      />
                    </div>
                  ) : (
                    <span>No cover image found</span>
                  )}
                  <div className="flex flex-col w-1/2 py-4 gap-4">
                    <span className="flex flex-col gr gap-2 items-center justify-center">
                      <span className="text-sm">Output Gain</span>
                      <Knob
                        onValueChange={onOutputGainChange}
                        onValueCommit={onOutputGainCommit}
                        value={outputGain}
                        min={0}
                        max={1}
                        step={0.01}
                        color={trackColor}
                        size={48}
                        showValue={false}
                      />
                      <NumberInput
                        min={0}
                        max={1}
                        step={0.01}
                        value={outputGain}
                        onCommit={onOutputGainCommit}
                      />
                    </span>

                    <div className="flex items-center gap-2 justify-evenly">
                      <span className="flex flex-col gap-2 items-center justify-center">
                        <span className="text-sm">Attack</span>
                        <Knob
                          onValueChange={onAttackChange}
                          onValueCommit={onAttackCommit}
                          value={track.sampler.attack}
                          min={0}
                          max={1}
                          step={0.01}
                          color={trackColor}
                          size={48}
                          showValue={false}
                        />
                        <NumberInput
                          min={0}
                          max={1}
                          value={track.sampler.attack}
                          onCommit={onAttackCommit}
                          suffix="s"
                        />
                      </span>
                      <span className="flex flex-col gap-2 items-center justify-center">
                        <span className="text-sm">Release</span>
                        <Knob
                          onValueChange={onReleaseChange}
                          onValueCommit={onReleaseCommit}
                          value={track.sampler.release}
                          min={0}
                          max={1}
                          step={0.01}
                          color={trackColor}
                          size={48}
                          showValue={false}
                        />
                        <NumberInput
                          min={0}
                          max={1}
                          value={track.sampler.release}
                          onCommit={onReleaseCommit}
                          suffix="s"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items.center justify-center">
              <span className="font-semibold flex items-center justify-center">
                No instrument selected
              </span>
            </div>
          )}
        </div>
      </StudioDialog>
    );
  }
);
