import { useAudioEngine } from "@/pages/studio/hooks";
import { Plus } from "lucide-react";

export const NewTrackPanelsButton = () => {
  const { mixer } = useAudioEngine();
  return (
    <div className="w-full py-2 flex items-center justify-center">
      <button
        className="h-16 w-16 rounded-full bg-[#fd3574]/10 hover:bg-[#fd3574]/20 flex items-center justify-center mb-4 transition-all transition-500 transition-ease"
        onClick={() => mixer.createTrack()}
        type="button"
      >
        <Plus className="h-8 w-8 text-[#fd3574]" />
      </button>
    </div>
  );
};
