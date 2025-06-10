import { BpmInput, TimeSignatureIcon } from "./components";
import { FaEllipsis } from "react-icons/fa6";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { keys, timeSignatureOptions } from "@/pages/studio/audio-engine/types";
import { StudioDropdownMenu } from "@/components/ui/custom/studio/studio-dropdown-menu";

export const TimelineControls = observer(() => {
  const audioEngine = useAudioEngine();

  const { timeline } = audioEngine;

  const currentValue = timeSignatureOptions
    .find((option) => parseFloat(option.value) === timeline.timeSignature)
    ?.label.split("/");

  const [upper, lower] = currentValue?.map((string) => parseInt(string)) ?? [
    4, 4,
  ];

  const hiddenClassName = "hidden sm:flex mr-1";

  return (
    <>
      <BpmInput className={hiddenClassName} />
      <span className={hiddenClassName}>
        <StudioDropdown
          style={{ width: "5rem" }}
          options={timeSignatureOptions}
          value={timeline.timeSignature.toString()}
          showSelectedValue={false}
          icon={
            <TimeSignatureIcon
              upper={upper}
              lower={lower}
              className="h-7 w-7 lg:h-8 lg:w-8 text-surface-5 fill-current"
            />
          }
          size="lg"
          colorOffset={0}
          onChange={(value) => timeline.setTimeSignature(parseFloat(value))}
        />
      </span>

      <span className={hiddenClassName}>
        <StudioDropdown
          style={{ width: "5rem" }}
          options={keys.map((key) => ({
            label: key.replace("b", "♭").replace("#", "♯"),
            value: key,
          }))}
          value={audioEngine.key}
          showSelectedValue={true}
          size="lg"
          colorOffset={0}
          onChange={(value) => audioEngine.setKey(value)}
        />
      </span>

      <div className="block sm:hidden h-full items-center flex w-6 text-surface-6 text-2xl justify-center mr-2">
        <StudioDropdownMenu
          triggerIcon={() => <FaEllipsis />}
          triggerClassName="bg-transparent"
          onValueChange={() => {}}
          options={[
            {
              render: () => (
                <span className="flex gap-1 h-fit min-h-6 w-[120px] items-center justify-between">
                  <BpmInput className="flex items-center gap-1" />
                </span>
              ),
            },
            { separator: true },
            {
              render: () => (
                <span className="flex gap-1 w-[120px] items-center justify-between">
                  <StudioDropdown
                    style={{ width: "5rem" }}
                    options={timeSignatureOptions}
                    value={timeline.timeSignature.toString()}
                    showSelectedValue={false}
                    icon={
                      <TimeSignatureIcon
                        upper={upper}
                        lower={lower}
                        className="h-7 w-7 lg:h-8 lg:w-8 text-surface-5 fill-current"
                      />
                    }
                    size="lg"
                    colorOffset={0}
                    onChange={(value) =>
                      timeline.setTimeSignature(parseFloat(value))
                    }
                  />
                </span>
              ),
            },
            { separator: true },
            {
              render: () => (
                <span className="flex gap-1 w-[120px] items-center justify-between">
                  <StudioDropdown
                    style={{ width: "5rem" }}
                    options={keys.map((key) => ({
                      label: key.replace("b", "♭").replace("#", "♯"),
                      value: key,
                    }))}
                    value={audioEngine.key}
                    showSelectedValue={true}
                    size="lg"
                    colorOffset={0}
                    onChange={(value) => audioEngine.setKey(value)}
                  />
                </span>
              ),
            },
          ]}
        />
      </div>
    </>
  );
});
