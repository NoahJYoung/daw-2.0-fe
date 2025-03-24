import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudioButton } from "./studio-button";
import { IconType } from "react-icons/lib";
import { cn } from "@/lib/utils";
import { isMobileDevice } from "@/pages/studio/utils";

interface StudioDialogProps {
  triggerClassName: string;
  children: React.ReactNode;
  triggerIcon?: IconType;
  label?: string;
  title?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  renderTrigger?: boolean;
  onOpenChange?: (state: boolean) => void;
}

export const StudioDialog = ({
  triggerClassName,
  title,
  triggerIcon: TriggerIcon,
  disabled,
  children,
  label,
  open,
  renderTrigger = true,
  onOpenChange,
  defaultOpen = false,
}: StudioDialogProps) => {
  const [position, setPosition] = useState({ x: -256, y: -186 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: -256, y: -186 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const isMobile = isMobileDevice();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.classList.contains("dialog-header") ||
        e.target.closest(".dialog-header"))
    ) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const clampX = (value: number) =>
    Math.min(
      Math.max(value, -(window.innerWidth / 2 - 10)),
      window.innerWidth / 2 -
        10 -
        (dialogRef?.current?.getBoundingClientRect()?.width || 0)
    );

  const clampY = (value: number) =>
    Math.min(
      Math.max(value, -(window.innerHeight / 2 - 10)),
      window.innerHeight / 2 -
        10 -
        (dialogRef?.current?.getBoundingClientRect()?.height || 0)
    );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.stopPropagation();
        const newX = Math.round(clampX(e.clientX - startPos.x));
        const newY = Math.round(clampY(e.clientY - startPos.y));
        setPosition({ x: newX, y: newY });
      }
    },
    [isDragging, startPos.x, startPos.y]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging && !isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, isDragging, isMobile, startPos]);

  const isLandscape = isMobile && window.innerWidth > window.innerHeight;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      modal={false}
    >
      {renderTrigger && (
        <DialogTrigger disabled={disabled} asChild>
          <StudioButton
            disabled={disabled}
            className={triggerClassName}
            icon={TriggerIcon}
            label={label}
          />
        </DialogTrigger>
      )}
      <DialogContent
        ref={dialogRef}
        onInteractOutside={(e) => e.preventDefault()}
        className="select-none w-full h-full md:max-h-[372px] flex flex-col bg-surface-mid p-2 gap-1 absolute"
        style={{
          height: isLandscape ? "98vh" : undefined,
          transform: isMobile
            ? `translate(${-50}%, ${-42}%)`
            : `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? "grabbing" : "default",
          transition: isDragging ? "none" : "default",
        }}
      >
        {title && (
          <DialogHeader
            className={cn(
              "h-[24px] dialog-header",
              { "cursor-grabbing": isDragging },
              { "cursor-grab": !isDragging }
            )}
            onMouseDown={handleMouseDown}
          >
            <DialogTitle className="max-h-full text-surface-6">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="h-[calc(100%-4px)] md:h-[calc(100%-24px)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
