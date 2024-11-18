import { observer } from "mobx-react-lite";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ReactElement, useCallback, useEffect } from "react";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { PiCaretUpDownFill } from "react-icons/pi";
import {
  useAudioEngine,
  useBottomPanelViewController,
  useUndoManager,
} from "../../hooks";
interface StudioLayoutProps {
  upperPanel: ReactElement;
  middlePanel: ReactElement;
  lowerPanel: ReactElement;
}

export const StudioLayout = observer(
  ({ upperPanel, lowerPanel, middlePanel }: StudioLayoutProps) => {
    const { mixer } = useAudioEngine();
    const { undoManager } = useUndoManager();
    const { panelGroupRef, bottomPanelRef, topPanelRef, toggleBottomPanel } =
      useBottomPanelViewController();

    const handleResize = useCallback(
      () => undoManager.withoutUndo(() => mixer.refreshTopPanelHeight()),
      [mixer, undoManager]
    );

    useEffect(() => {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return (
      <section className="bg-surface-0 text-foreground p-1">
        <PanelGroup
          ref={panelGroupRef}
          style={{ height: "calc(100vh - 0.5rem)" }}
          autoSaveId="studio-layout"
          direction="vertical"
          className="bg-surface-0"
        >
          <Panel
            className="bg-surface-0"
            order={1}
            ref={topPanelRef}
            defaultSize={65}
            maxSize={100}
            minSize={0}
          >
            <div className="w-full h-full">{upperPanel}</div>
          </Panel>
          <PanelResizeHandle
            style={{ borderTopWidth: 1 }}
            className="z-10 h-2 ml-[2px] bg-surface-mid border-0 border-surface-1"
          />
          <div className="z-20 flex bg-surface-mid ml-[2px] pl-[4px] w-full items-start h-[48px] sm:gap-5 justify-between md:justify-start">
            <StudioButton
              className="rounded-xxs shadow-none text-xl relative flex items-center justify-centers p-1 w-10 h-10 bg-transparent text-surface-3 hover:text-surface-4 hover:bg-transparent"
              icon={PiCaretUpDownFill}
              onClick={toggleBottomPanel}
            />
            {middlePanel}
          </div>
          <Panel
            className="z-20 bg-surface-mid ml-[2px] w-full lg:px-12"
            order={2}
            ref={bottomPanelRef}
            defaultSize={45}
            maxSize={100}
            minSize={0}
          >
            <div className="w-full h-full">{lowerPanel}</div>
          </Panel>
        </PanelGroup>
      </section>
    );
  }
);
