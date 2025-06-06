/* eslint-disable @typescript-eslint/no-explicit-any */
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { BookHeadphones } from "lucide-react";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { PiMetronomeFill, PiMagnetStraight } from "react-icons/pi";
import { MdContentPasteGo, MdContentCopy } from "react-icons/md";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdSave,
  IoIosSettings,
} from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";
import { CiRedo, CiUndo, CiZoomIn, CiZoomOut } from "react-icons/ci";
import { observer } from "mobx-react-lite";
import { TRACK_PANEL_EXPANDED_WIDTH } from "@/pages/studio/utils/constants";
import { useFileSystem, useThemeContext } from "@/hooks";
import { useTranslation } from "react-i18next";
import { StudioDropdownMenu } from "@/components/ui/custom/studio/studio-dropdown-menu";
import {
  NoteValue,
  SubdivisionSelectOptions,
} from "@/pages/studio/audio-engine/components/timeline/types";
import { FaFileExport as ExportIcon } from "react-icons/fa";
import { FaFileImport as ImportIcon } from "react-icons/fa";
import { MdSaveAs as SaveAsIcon } from "react-icons/md";
import { pasteClips } from "../timeline-view/components/clips/helpers";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { getOnlineBounce } from "@/pages/studio/audio-engine/helpers";
import { useToast } from "@/components/ui/use-toast";
import {
  audioBufferCache,
  waveformCache,
} from "@/pages/studio/audio-engine/components";
import { ProjectSettingsDialog } from "./components";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Note } from "@/components/ui/custom/note";
import { HarmonicAnalysisModal } from "../../../harmonic-analysis-modal";

interface ToolbarProps {
  panelExpanded: boolean;
  togglePanelView: () => void;
}

export const Toolbar = observer(
  ({ panelExpanded, togglePanelView }: ToolbarProps) => {
    const { projectId } = useParams({ strict: false });
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const { undoManager } = useUndoManager();
    const { toggleTheme, theme } = useThemeContext();
    const { saveProject } = useFileSystem();
    const navigate = useNavigate();
    const tempProjectId = useSearch({
      from: projectId
        ? "/app/projects/studio/$projectId"
        : "/app/projects/studio",
      select: (search) => search.tempProjectId,
    });
    const audioEngine = useAudioEngine();
    const { timeline, metronome, clipboard, mixer } = audioEngine;
    const { t } = useTranslation();
    const { toast } = useToast();

    const hasOpenedNewProjectDialog = useRef(false);
    const isNewProject = !projectId && !tempProjectId;
    const [projectSettingsModalOpen, setProjectSettingsModalOpen] =
      useState(false);

    const toggleAnalysisModal = () => setIsAnalysisModalOpen((prev) => !prev);

    useEffect(() => {
      const hasOpened = hasOpenedNewProjectDialog.current;
      if (
        isNewProject &&
        !hasOpened &&
        !audioEngine.loadingState &&
        audioEngine.loaded === true
      ) {
        setProjectSettingsModalOpen(true);
      }
    }, [audioEngine.loaded, audioEngine.loadingState, isNewProject]);

    const updateURLWithoutNavigation = (createdId: string) => {
      navigate({ search: { tempProjectId: createdId } as any });
    };

    const handleSave = async () => {
      try {
        const zip = await audioEngine.getProjectZip(false);
        if (zip) {
          const createdId = await saveProject(
            audioEngine.projectName,
            zip,
            tempProjectId ?? projectId
          );
          if (createdId) {
            updateURLWithoutNavigation(createdId);

            toast({
              title: "Success!",
              description: "Project created successfully",
            });
          } else {
            toast({
              title: "Success!",
              description: "Project saved successfully",
            });
          }
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Oops!",
          description: error?.message ?? "Something went wrong",
        });
      }
    };

    const handleSaveAs = async () => {
      try {
        const zip = await audioEngine.getProjectZip(false);
        if (zip) {
          const projectId = await saveProject(audioEngine.projectName, zip);
          if (projectId) {
            updateURLWithoutNavigation(projectId);

            toast({
              title: "Success!",
              description: "Project created successfully",
            });
          }
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Oops!",
          description: error?.message ?? "Something went wrong",
        });
      }
    };

    const handleExit = () => {
      waveformCache.clear();
      audioBufferCache.clear();
      undoManager.clearUndo();
      undoManager.clearRedo();
      navigate({ to: "/" });
    };

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
          triggerIcon={() => (
            <Note
              className="w-6 h-6"
              value={timeline.subdivision as NoteValue}
            />
          )}
          title={t("studio.toolbar.subdivision")}
          value={timeline.subdivision}
          onValueChange={(newValue) => timeline.setSubdivision(newValue)}
          options={SubdivisionSelectOptions.map((option) => ({
            label: option.label,
            value: option.value,
            icon: () => <Note className="w-5 h-5" value={option.value} />,
            disabled: false,
          }))}
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
              onClick: handleSave,
              disabled: false,
            },
            {
              label: "Save As",
              icon: SaveAsIcon,
              onClick: handleSaveAs,
              disabled: !(tempProjectId || projectId),
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
              onClick: () => audioEngine.loadProjectDataFromFile(),
            },
            { separator: true },
            {
              label: "Bounce to .wav",
              icon: IoDownloadOutline,
              onClick: async () => getOnlineBounce(audioEngine),
            },
          ]}
        />

        <StudioButton
          title={t("studio.toolbar.exit")}
          icon={() => <IoExitOutline className="rotate-180" />}
          onClick={handleExit}
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
          title={"Analysis"}
          icon={() => <BookHeadphones />}
          onClick={toggleAnalysisModal}
        />

        <StudioDropdownMenu
          triggerIcon={IoIosSettings}
          title={t("studio.toolbar.settings")}
          onValueChange={() => {}}
          options={[
            {
              label: theme === "dark" ? "Light Mode" : "Dark Mode",
              onClick: toggleTheme,
              icon: () =>
                theme === "dark" ? (
                  <Sun className="h-4 w-5" />
                ) : (
                  <Moon className="h-4 w-4" />
                ),
            },
            {
              label: "Project Settings",
              onClick: () => setProjectSettingsModalOpen(true),
              icon: () => <IoIosSettings className="h-4 w-4" />,
            },
          ]}
        />
        <ProjectSettingsDialog
          open={projectSettingsModalOpen}
          onOpenChange={setProjectSettingsModalOpen}
        />
        <HarmonicAnalysisModal
          onClose={() => setIsAnalysisModalOpen(false)}
          isOpen={isAnalysisModalOpen}
        />
      </div>
    );
  }
);
