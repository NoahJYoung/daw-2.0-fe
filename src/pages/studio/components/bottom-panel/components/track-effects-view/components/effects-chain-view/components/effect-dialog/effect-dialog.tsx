import { MonoMeterFader } from "@/components/ui/custom/studio/mono-meter-fader";
import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { Track } from "@/pages/studio/audio-engine/components";
import { Effect } from "@/pages/studio/audio-engine/components/effect";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { IconType } from "react-icons/lib";
import { getEffectByKey } from "./helpers";
import { isMobileDevice } from "@/pages/studio/utils";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, useState } from "react";

interface SynthSettingsModalProps {
  track: Track;
  effect: Effect;
  open: boolean;
  renderTrigger?: boolean;
  triggerIcon?: IconType;
}

const triggerClassName = `rounded-xs focus-visible:ring-0 relative flex items-center justify-center p-1 w-full bg-surface-2 text-surface-7 hover:bg-surface-3`;

export const EffectDialog = observer(
  ({
    effect,
    track,
    triggerIcon,
    renderTrigger,
    open,
  }: SynthSettingsModalProps) => {
    const { state } = useAudioEngine();
    const { undoManager } = useUndoManager();

    const onInputVolumeChange = (value: number) => {
      effect.setInputVolume(value);
    };

    const onOutputVolumeChange = (value: number) => {
      effect.setOutputVolume(value);
    };

    const active =
      state === AudioEngineState.recording ||
      state === AudioEngineState.playing;

    const Effect = getEffectByKey(effect.name);

    const onOpenChange = (state: boolean) => {
      undoManager.withoutUndo(() => {
        effect.setDialogOpen(state);
      });
    };

    const isMobile = isMobileDevice();
    const faderHeight = isMobile ? 156 : 172;

    const [upperRect, setUpperRect] = useState<DOMRect | null>(null);
    const upperContainerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (!open) return;

      const timeoutId = setTimeout(() => {
        const upperContainer = upperContainerRef.current;
        if (!upperContainer) return;

        setUpperRect(upperContainer.getBoundingClientRect());

        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            setUpperRect(entry.contentRect);
          }
        });

        resizeObserver.observe(upperContainer);

        return () => {
          resizeObserver.disconnect();
        };
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [open]);

    return (
      <StudioDialog
        open={open}
        onOpenChange={onOpenChange}
        title={isMobile ? "" : `${track.name} - ${effect.name} `}
        label={effect.name}
        renderTrigger={renderTrigger}
        triggerIcon={triggerIcon}
        triggerClassName={triggerClassName}
      >
        <div className="h-full flex flex-col p-1">
          <div
            ref={upperContainerRef}
            className="w-full h-full overflow-x-auto styled-scrollbar-sm md:h-1/2 shadow-sm border rounded-md"
          >
            {
              <Effect.Upper
                effect={effect}
                track={track}
                width={upperRect?.width || 0}
                height={upperRect?.height || 0}
              />
            }
          </div>

          <div className="flex items-center justify-between w-full md:h-1/2 p-1">
            {!isMobile && (
              <div className="w-[58px]">
                <MonoMeterFader
                  faderHeight={faderHeight}
                  onChange={onInputVolumeChange}
                  step={0.01}
                  min={-60}
                  max={12}
                  value={effect.inputVolume}
                  meter={effect.inputMeter}
                  stopDelayMs={2000}
                  active={active}
                />
              </div>
            )}
            <div
              className={cn("w-full h-full", {
                "lg:w-[calc(100%-116px)]": !isMobile,
              })}
            >
              {
                <Effect.Lower
                  effect={effect}
                  track={track}
                  width={upperRect?.width || 0}
                  height={upperRect?.height || 0}
                />
              }
            </div>
            {!isMobile && (
              <div className="w-[58px]">
                <MonoMeterFader
                  faderHeight={faderHeight}
                  onChange={onOutputVolumeChange}
                  step={0.01}
                  min={-60}
                  max={12}
                  value={effect.outputVolume}
                  meter={effect.outputMeter}
                  stopDelayMs={2000}
                  active={active}
                  orientation="right"
                />
              </div>
            )}
          </div>
        </div>
      </StudioDialog>
    );
  }
);
