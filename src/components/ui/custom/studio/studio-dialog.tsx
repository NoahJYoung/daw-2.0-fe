import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudioButton } from "./studio-button";
import { IconType } from "react-icons/lib";

interface StudioDialogProps {
  triggerClassName: string;
  triggerIcon: IconType;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
}

export const StudioDialog = ({
  triggerClassName,
  title,
  triggerIcon: TriggerIcon,
  disabled,
  children,
}: StudioDialogProps) => (
  <Dialog modal={false}>
    <DialogTrigger disabled={disabled} asChild>
      <StudioButton
        disabled={disabled}
        className={triggerClassName}
        icon={TriggerIcon}
      />
    </DialogTrigger>
    <DialogContent
      onInteractOutside={(e) => e.preventDefault()}
      className="w-full h-full max-h-[400px] flex flex-col bg-surface-mid p-4"
    >
      {title && (
        <DialogHeader className="h-[24px]">
          <DialogTitle className="max-h-full text-surface-6">
            {title}
          </DialogTitle>
        </DialogHeader>
      )}
      <div className="h-[calc(100%-24px)]">{children}</div>
    </DialogContent>
  </Dialog>
);
