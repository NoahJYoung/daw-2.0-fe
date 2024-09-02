import { observer } from "mobx-react-lite";
import { TrackPanels, TimelineView, Toolbar } from "./components";
import { useLinkedScroll } from "./hooks";
import { useState } from "react";
import {
  TRACK_PANEL_COLLAPSED_WIDTH,
  TRACK_PANEL_EXPANDED_WIDTH,
} from "../../utils/constants";

export const TopPanel = observer(() => {
  const { onScroll, timelineRef, panelsRef } = useLinkedScroll();
  const [panelExpanded, setPanelExpanded] = useState(true);

  const togglePanelView = () => setPanelExpanded(!panelExpanded);

  return (
    <div className="flex max-h-full h-full">
      <div
        className={`flex-shrink-0 h-full`}
        style={{
          transition: "max-width 0.3s ease",
          maxWidth: panelExpanded
            ? TRACK_PANEL_EXPANDED_WIDTH
            : TRACK_PANEL_COLLAPSED_WIDTH,
        }}
      >
        <Toolbar
          panelExpanded={panelExpanded}
          togglePanelView={togglePanelView}
        />

        <TrackPanels onScroll={onScroll} scrollRef={panelsRef} />
      </div>

      <TimelineView onScroll={onScroll} scrollRef={timelineRef} />
    </div>
  );
});
