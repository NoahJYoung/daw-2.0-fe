import { BpmInput, TimeSignatureIcon } from "./components";
import { FaEllipsis } from "react-icons/fa6";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { isMobileDevice } from "@/pages/studio/utils";

const timeSignatureOptions = [
  { label: "2/4", value: "2" },
  { label: "3/4", value: "3" },
  { label: "4/4", value: "4" },
  { label: "5/4", value: "5" },
  { label: "6/4", value: "6" },
  { label: "7/4", value: "7" },
  { label: "5/8", value: "2.5" },
  { label: "7/8", value: "3.5" },
  { label: "9/8", value: "4.5" },
  { label: "11/8", value: "5.5" },
];

export const TimelineControls = observer(() => {
  const { timeline } = useAudioEngine();

  const currentValue = timeSignatureOptions
    .find((option) => parseFloat(option.value) === timeline.timeSignature)
    ?.label.split("/");

  const [upper, lower] = currentValue?.map((string) => parseInt(string)) ?? [
    4, 4,
  ];

  const hiddenClassName = "hidden sm:flex mr-1";
  const isMobile = isMobileDevice();

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
              className="h-7 w-7 md:h-8 md:w-8 text-surface-5 fill-current"
            />
          }
          size="lg"
          colorOffset={0}
          onChange={(value) => timeline.setTimeSignature(parseFloat(value))}
        />
      </span>

      {/* </div> */}

      <div className="block sm:hidden h-full items-center flex w-6 text-surface-6 text-2xl justify-center mr-2">
        <button>
          <FaEllipsis />
        </button>
      </div>
    </>
  );
});
