import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { PiMetronomeFill, PiMagnetStraight } from "react-icons/pi";
import { MdContentPasteGo, MdContentCopy } from "react-icons/md";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdSave,
  IoIosSettings,
} from "react-icons/io";
import { PiUserList } from "react-icons/pi";
import { PiMusicNoteSimpleFill } from "react-icons/pi";
import { IoDownloadOutline } from "react-icons/io5";
import { CiRedo, CiUndo, CiZoomIn, CiZoomOut } from "react-icons/ci";
import { observer } from "mobx-react-lite";
import { TRACK_PANEL_EXPANDED_WIDTH } from "@/pages/studio/utils/constants";
import { useThemeContext, useUser } from "@/hooks";
import { useTranslation } from "react-i18next";
import { StudioDropdownMenu } from "@/components/ui/custom/studio/studio-dropdown-menu";
import { SubdivisionSelectOptions } from "@/pages/studio/audio-engine/components/timeline/types";
import { FaFileExport as ExportIcon } from "react-icons/fa";
import { FaFileImport as ImportIcon } from "react-icons/fa";
import { MdSaveAs as SaveAsIcon } from "react-icons/md";
import { pasteClips } from "../timeline-view/components/clips/helpers";
import { useParams } from "react-router-dom";

interface ToolbarProps {
  panelExpanded: boolean;
  togglePanelView: () => void;
}

export const Toolbar = observer(
  ({ panelExpanded, togglePanelView }: ToolbarProps) => {
    const { user } = useUser();
    const { projectId } = useParams();
    const { undoManager } = useUndoManager();
    const { toggleTheme } = useThemeContext();
    const audioEngine = useAudioEngine();
    const { timeline, metronome, clipboard, mixer } = audioEngine;
    const { t } = useTranslation();

    return (
      <div
        style={{ minWidth: TRACK_PANEL_EXPANDED_WIDTH, padding: 2 }}
        className="grid grid-cols-7 gap-y-1 border-surface-0 border-b-2"
      >
        <StudioButton
          title={
            panelExpanded
              ? t("studio.toolbar.collapse")
              : t("studio.toolbar.expand")
          }
          icon={panelExpanded ? IoIosArrowBack : IoIosArrowForward}
          onClick={togglePanelView}
        />
        <StudioButton
          icon={PiMetronomeFill}
          title={t("studio.toolbar.metronome")}
          onClick={() =>
            undoManager.withoutUndo(() =>
              metronome.setActive(!metronome.active)
            )
          }
          on={metronome.active}
          onClassName="text-surface-10"
        />
        <StudioButton
          title={t("studio.toolbar.snapToGrid")}
          icon={PiMagnetStraight}
          onClick={() =>
            undoManager.withoutUndo(() =>
              timeline.setSnapToGrid(!timeline.snapToGrid)
            )
          }
          on={timeline.snapToGrid}
          onClassName="text-surface-10"
        />

        <StudioDropdownMenu
          triggerIcon={PiMusicNoteSimpleFill}
          title={t("studio.toolbar.subdivision")}
          value={timeline.subdivision}
          onValueChange={(newValue) => timeline.setSubdivision(newValue)}
          options={SubdivisionSelectOptions}
        />

        <StudioButton
          title={t("studio.toolbar.undo")}
          disabled={!undoManager.canUndo}
          icon={CiUndo}
          onClick={() => undoManager.undo()}
        />
        <StudioButton
          title={t("studio.toolbar.redo")}
          disabled={!undoManager.canRedo}
          icon={CiRedo}
          onClick={() => undoManager.redo()}
        />

        <StudioDropdownMenu
          triggerIcon={IoMdSave}
          title={t("studio.toolbar.save")}
          onValueChange={() => {}}
          options={[
            {
              label: "Save",
              icon: IoMdSave,
              onClick: () => console.log(audioEngine.serialize()),
              disabled: !user || true,
            },
            {
              label: "Save As",
              icon: SaveAsIcon,
              onClick: () => {
                console.log(audioEngine.serialize());
              },
              disabled: !projectId,
            },
            { separator: true },
            {
              label: "Export Project",
              icon: ExportIcon,
              onClick: () => audioEngine.getProjectZip(),
            },
            {
              label: "Import Project",
              icon: ImportIcon,
              onClick: () => audioEngine.loadProjectData(),
            },
          ]}
        />

        <StudioButton
          title={t("studio.toolbar.userMenu")}
          icon={PiUserList}
          onClick={() => {}}
        />

        <StudioButton
          title={t("studio.toolbar.zoomOut")}
          disabled={!timeline.canZoomOut}
          icon={CiZoomOut}
          onClick={() => undoManager.withoutUndo(() => timeline.zoomOut())}
        />
        <StudioButton
          title={t("studio.toolbar.zoomIn")}
          disabled={!timeline.canZoomIn}
          icon={CiZoomIn}
          onClick={() => undoManager.withoutUndo(() => timeline.zoomIn())}
        />

        <StudioButton
          title={t("studio.toolbar.copy")}
          icon={MdContentCopy}
          onClick={() => clipboard.copy(mixer.selectedClips)}
          disabled={mixer.selectedClips.length === 0}
        />

        <StudioButton
          title={t("studio.toolbar.paste")}
          icon={MdContentPasteGo}
          onClick={() => pasteClips(clipboard, mixer, undoManager)}
          disabled={
            clipboard.getClips().length === 0 ||
            mixer.selectedTracks.length === 0
          }
        />

        <StudioButton
          title={t("studio.toolbar.download")}
          icon={IoDownloadOutline}
          onClick={async () => audioEngine.getOfflineBounce()}
        />

        <StudioDropdownMenu
          triggerIcon={IoIosSettings}
          title={t("studio.toolbar.settings")}
          onValueChange={() => {}}
          options={[{ label: "Toggle Theme", onClick: toggleTheme }]}
        />
      </div>
    );
  }
);
