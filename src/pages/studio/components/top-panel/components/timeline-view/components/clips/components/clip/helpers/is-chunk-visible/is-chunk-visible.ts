/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";

export const isChunkVisible = (
  chunk: Peak[],
  index: number,
  clipLeft: number,
  scrollLeft: number
) => {
  // const chunkWidth = chunk.length;

  // const chunkLeft = clipLeft + index * chunkWidth;
  // const chunkRight = chunkLeft + chunkWidth;

  // const visibleRange = [
  //   Math.max(scrollLeft, 0),
  //   scrollLeft + window.innerWidth,
  // ];

  // TODO: Evaluate whether this is actually making a difference performance wise

  const condition = true; //chunkRight > visibleRange[0] && chunkLeft < visibleRange[1];
  return condition;
};
