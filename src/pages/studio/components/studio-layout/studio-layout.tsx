import { observer } from "mobx-react-lite";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { ReactElement, useRef } from "react";
import { useThemeContext } from "@/hooks";

interface StudioLayoutProps {
  upperPanel: ReactElement;
  middlePanel: ReactElement;
  lowerPanel: ReactElement;
}

export const StudioLayout = observer(
  ({ upperPanel, lowerPanel, middlePanel }: StudioLayoutProps) => {
    const topPanelRef = useRef<ImperativePanelHandle>(null);
    const bottomPanelRef = useRef<ImperativePanelHandle>(null);
    const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
    const { toggleTheme } = useThemeContext();

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
          <PanelResizeHandle>
            <div
              className="w-full border border-secondary"
              style={{
                height: 48,
              }}
            >
              {middlePanel}
              <button onClick={toggleBottomPanel}>
                {bottomPanelRef?.current?.isExpanded() ? "Collapse" : "Expand"}
              </button>
              <button onClick={toggleTheme}>Toggle Theme</button>
            </div>
          </PanelResizeHandle>
          <Panel
            order={2}
            onExpand={() => alert("EXPANDING")}
            onCollapse={() => alert("Collapsing")}
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
