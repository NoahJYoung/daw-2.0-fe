import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { SliderThumb } from "./slider-thumb";

import { cn } from "@/lib/utils";

interface StudioSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showTrack?: boolean;
  thumbSize?: "sm" | "lg";
}

const StudioSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  StudioSliderProps
>(({ className, showTrack = true, thumbSize, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none z-10",
      "data-[orientation='horizontal']:h-1 data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
      "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1 data-[orientation='vertical']:justify-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative grow overflow-hidden rounded-full",
        showTrack ? "bg-black" : "bg-transparent",
        "data-[orientation='horizontal']:h-1 data-[orientation='horizontal']:w-full",
        "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          showTrack ? "bg-black" : "bg-transparent",
          "data-[orientation='horizontal']:h-full",
          "data-[orientation='vertical']:w-full"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block cursor-grab rounded-none border-none">
      <SliderThumb
        className="cursor-grab text-surface-6 disabled:pointer-events-none opacity-100 disabled:opacity-50 hover:scale-105 active:cursor-grabbing"
        orientation={props.orientation ?? "vertical"}
        size={thumbSize}
      />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));
StudioSlider.displayName = SliderPrimitive.Root.displayName;

export { StudioSlider };
