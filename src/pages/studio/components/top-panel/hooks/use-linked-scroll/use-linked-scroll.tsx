import { useRef } from "react";

export const useLinkedScroll = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scrollTop = e.currentTarget.scrollTop;

    if (timelineRef.current) {
      timelineRef.current.scrollTop = scrollTop;
    }

    if (panelsRef.current) {
      panelsRef.current.scrollTop = scrollTop;
    }
  };

  return {
    onScroll,
    timelineRef,
    panelsRef,
  };
};
