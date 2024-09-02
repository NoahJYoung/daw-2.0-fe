import { StudioButton } from "@/components/ui/custom/studio-button";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { PiMetronomeFill, PiMagnetStraight } from "react-icons/pi";
import { MdContentPasteGo, MdContentCopy } from "react-icons/md";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdSave,
  IoIosSettings,
} from "react-icons/io";
import { FaUserCog } from "react-icons/fa";
import { PiMusicNoteSimpleFill } from "react-icons/pi";
import { IoDownloadOutline } from "react-icons/io5";
import { CiRedo, CiUndo, CiZoomIn, CiZoomOut } from "react-icons/ci";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { TRACK_PANEL_EXPANDED_WIDTH } from "@/pages/studio/utils/constants";
import { useThemeContext } from "@/hooks";
import { useTranslation } from "react-i18next";

interface ToolbarProps {
  panelExpanded: boolean;
  togglePanelView: () => void;
}

export const Toolbar = observer(
  ({ panelExpanded, togglePanelView }: ToolbarProps) => {
    const undoManager = useUndoManager();
    const { toggleTheme } = useThemeContext();
    const audioEngine = useAudioEngine();
    const { timeline } = audioEngine;
    const { t } = useTranslation();

    const [fakeMetronome, setFakeMetronome] = useState(false);

    return (
      <div
        style={{ minWidth: TRACK_PANEL_EXPANDED_WIDTH }}
        className="grid grid-cols-7 gap-y-1 border-surface-0 border-b-4"
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
            undoManager.withoutUndo(() => setFakeMetronome(!fakeMetronome))
          }
          on={fakeMetronome}
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

        <StudioButton
          title={t("studio.toolbar.subdivision")}
          icon={PiMusicNoteSimpleFill}
          onClick={() => {}}
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

        <StudioButton
          title={t("studio.toolbar.save")}
          icon={IoMdSave}
          onClick={() => {}}
        />

        <StudioButton
          title={t("studio.toolbar.settings")}
          onClick={() => toggleTheme()}
          icon={IoIosSettings}
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
          onClick={() => {}}
        />

        <StudioButton
          title={t("studio.toolbar.paste")}
          icon={MdContentPasteGo}
          onClick={() => {}}
        />

        <StudioButton
          title={t("studio.toolbar.download")}
          icon={IoDownloadOutline}
          onClick={() => {}}
        />

        <StudioButton
          title={t("studio.toolbar.userMenu")}
          icon={FaUserCog}
          onClick={() => {}}
        />
      </div>
    );
  }
);
