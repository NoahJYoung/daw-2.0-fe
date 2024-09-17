import { observer } from "mobx-react-lite";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { ReactElement, useCallback, useEffect, useRef } from "react";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { PiCaretUpDownFill } from "react-icons/pi";
import { useAudioEngine, useUndoManager } from "../../hooks";
interface StudioLayoutProps {
  upperPanel: ReactElement;
  middlePanel: ReactElement;
  lowerPanel: ReactElement;
}

export const StudioLayout = observer(
  ({ upperPanel, lowerPanel, middlePanel }: StudioLayoutProps) => {
    const { mixer } = useAudioEngine();
    const undoManager = useUndoManager();
    const topPanelRef = useRef<ImperativePanelHandle>(null);
    const bottomPanelRef = useRef<ImperativePanelHandle>(null);
    const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

    const handleResize = useCallback(
      () => undoManager.withoutUndo(() => mixer.refreshTopPanelHeight()),
      [mixer, undoManager]
    );

    useEffect(() => {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    const toggleBottomPanel = () => {
      if (panelGroupRef.current) {
        const currentLayout = panelGroupRef.current.getLayout();
        if (currentLayout[1] > 0) {
          panelGroupRef.current.setLayout([100, 0]);
        } else {
          panelGroupRef.current.setLayout([50, 50]);
        }
      }
    };

    return (
      <section className="bg-surface-0 text-foreground p-1">
        <PanelGroup
          ref={panelGroupRef}
          style={{ height: "calc(100vh - 0.5rem)" }}
          autoSaveId="studio-layout"
          direction="vertical"
        >
          <Panel
            order={1}
            ref={topPanelRef}
            defaultSize={65}
            maxSize={100}
            minSize={35}
          >
            <div className="w-full h-full">{upperPanel}</div>
          </Panel>
          <PanelResizeHandle
            style={{ borderTopWidth: 1, marginLeft: 2 }}
            className="h-2 bg-surface-1 border-0 border-surface-0"
          />
          <div
            className="flex bg-surface-1  items-start h-[48px] gap-2"
            style={{ marginLeft: 2 }}
          >
            <StudioButton
              className="rounded-xxs shadow-none text-xl relative flex items-center justify-centers p-1 w-10 h-10 bg-transparent text-surface-3 hover:text-surface-4 hover:bg-transparent"
              icon={PiCaretUpDownFill}
              onClick={toggleBottomPanel}
            />
            {middlePanel}
          </div>
          <Panel
            className="bg-surface-1 ml-[2px]"
            order={2}
            ref={bottomPanelRef}
            defaultSize={45}
            maxSize={65}
            minSize={0}
          >
            <div className="w-full h-full border border-secondary">
              {lowerPanel}
            </div>
          </Panel>
        </PanelGroup>
      </section>
    );
  }
);
