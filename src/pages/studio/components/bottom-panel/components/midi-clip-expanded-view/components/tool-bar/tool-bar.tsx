import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { useUndoManager } from "@/pages/studio/hooks";
import { t } from "i18next";
import { observer } from "mobx-react-lite";
import { CiZoomOut, CiZoomIn } from "react-icons/ci";

interface ToolBarProps {
  clip: MidiClip;
}

export const ToolBar = observer(({ clip }: ToolBarProps) => {
  const { undoManager } = useUndoManager();
  return (
    <div className="flex items-center gap-1">
      <StudioButton
        title={t("studio.toolbar.zoomOut")}
        disabled={!clip.canZoomOut}
        icon={CiZoomOut}
        onClick={() => undoManager.withoutUndo(() => clip.zoomOut())}
      />
      <StudioButton
        title={t("studio.toolbar.zoomIn")}
        disabled={!clip.canZoomIn}
        icon={CiZoomIn}
        onClick={() => undoManager.withoutUndo(() => clip.zoomIn())}
      />
    </div>
  );
});
