import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const StudioSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none",
      "data-[orientation='horizontal']:h-1 data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
      "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1 data-[orientation='vertical']:justify-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative grow overflow-hidden rounded-full bg-secondary bg-black",
        "data-[orientation='horizontal']:h-1 data-[orientation='horizontal']:w-full",
        "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute bg-black",
          "data-[orientation='horizontal']:h-full",
          "data-[orientation='vertical']:w-full"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block bg-zinc-150 data-[orientation='vertical']:h-2 data-[orientation='vertical']:w-8 data-[orientation='horizontal']:h-8 data-[orientation='horizontal']:w-2 cursor-grab rounded-xxs border border-zinc-800 bg-zinc-100 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-125 active:cursor-grabbing" />
  </SliderPrimitive.Root>
));
StudioSlider.displayName = SliderPrimitive.Root.displayName;

export { StudioSlider };
