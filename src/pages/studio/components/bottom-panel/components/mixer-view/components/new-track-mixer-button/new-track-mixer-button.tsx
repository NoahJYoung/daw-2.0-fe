import { useAudioEngine } from "@/pages/studio/hooks";
import { IoMdAdd as PlusIcon } from "react-icons/io";

export const NewTrackMixerButton = () => {
  const { mixer } = useAudioEngine();
  return (
    <button
      className="flex-shrink-0 opacity-50 hover:opacity-100 my-[2px] w-[120px] h-full flex items-center justify-center text-2xl text-surface-4"
      onClick={() => mixer.createTrack()}
      type="button"
    >
      <PlusIcon className="h-[48px] w-[48px]" />
    </button>
  );
};
