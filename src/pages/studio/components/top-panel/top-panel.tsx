import { observer } from "mobx-react-lite";
import { TrackPanels, TimelineView } from "./components";
import { useLinkedScroll } from "./hooks";

export const TopPanel = observer(() => {
  const { onScroll, timelineRef, panelsRef } = useLinkedScroll();
  return (
    <div
      style={{ minHeight: "100%" }}
      className="flex h-full overflow-y-hidden"
    >
      <TrackPanels onScroll={onScroll} scrollRef={panelsRef} />
      <TimelineView onScroll={onScroll} scrollRef={timelineRef} />
    </div>
  );
});
