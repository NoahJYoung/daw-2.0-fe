import { BpmInput, TimeSignatureIcon } from "./components";
import { FaEllipsis } from "react-icons/fa6";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

const timeSignatureOptions = [
  { label: "2/4", value: "2" },
  { label: "3/4", value: "3" },
  { label: "4/4", value: "4" },
  { label: "5/4", value: "5" },
  { label: "5/8", value: "2.5" },
  { label: "7/8", value: "3.5" },
];

export const TimelineControls = observer(() => {
  const { timeline } = useAudioEngine();

  const currentValue = timeSignatureOptions
    .find((option) => parseFloat(option.value) === timeline.timeSignature)
    ?.label.split("/");

  const [upper, lower] = currentValue?.map((string) => parseInt(string)) ?? [
    4, 4,
  ];

  return (
    <>
      <div className="sm:gap-5 hidden sm:flex justify-between mr-1">
        <BpmInput />
        <StudioDropdown
          style={{ width: "5rem" }}
          options={timeSignatureOptions}
          value={timeline.timeSignature.toString()}
          showSelectedValue={false}
          icon={
            <TimeSignatureIcon
              upper={upper}
              lower={lower}
              className="h-8 w-8 text-surface-5 fill-current"
            />
          }
          size="lg"
          colorOffset={0}
          onChange={(value) => timeline.setTimeSignature(parseFloat(value))}
        />
      </div>

      <div className="block sm:hidden h-full items-center flex w-6 text-surface-6 justify-center mr-2">
        <button>
          <FaEllipsis />
        </button>
      </div>
    </>
  );
});
