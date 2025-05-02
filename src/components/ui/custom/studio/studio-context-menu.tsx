import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MenuItem } from "../types";
import { v4 } from "uuid";

interface StudioContextMenuProps {
  children?: React.ReactNode;
  items?: MenuItem[];
  disabled?: boolean;
  className?: string;
}

export const StudioContextMenu = ({
  children,
  items,
  disabled,
  className,
}: StudioContextMenuProps) => {
  const getSubMenu = ({
    children,
    label,
    onClick,
    shortcut,
    icon: Icon,
    separator,
    disabled,
    render,
  }: MenuItem) => {
    if (separator) {
      return <ContextMenuSeparator key={v4()} />;
    }

    if (render) {
      return (
        <ContextMenuItem
          className="data-[disabled]:opacity-50"
          key={label}
          inset={false}
          disabled={disabled}
        >
          {render()}
        </ContextMenuItem>
      );
    }

    if (children && children.length > 0) {
      return (
        <ContextMenuSub key={label}>
          <ContextMenuSubTrigger
            disabled={disabled}
            className="hover:bg-surface-2 rounded-xs gap-2 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
            inset={!Icon}
          >
            {Icon && <Icon className="w-[16px] h-[16px]" />}
            {label ?? ""}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="hover:bg-surface-2 w-56 rounded-xs">
            {children.map((child) => getSubMenu(child))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }
    return (
      <ContextMenuItem
        className="hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xs p-0"
        onClick={onClick}
        disabled={disabled}
        inset={!Icon}
        key={label}
      >
        <div className="w-full h-full p-0 m-0 bg-transparent hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xs px-2 py-1.5">
          {Icon && <Icon className="w-[16px] h-[16px]" />}
          <div className="hover:bg-surface-2 w-[104px] ">{label || ""}</div>
          {shortcut ? (
            <ContextMenuShortcut className="flex-grow-0 m-0 w-[40px]">
              {shortcut}
            </ContextMenuShortcut>
          ) : (
            <span className="w-[40px]" />
          )}
        </div>
      </ContextMenuItem>
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className || "h-full"} disabled={disabled}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        onClick={(e) => e.stopPropagation()}
        className="w-56 bg-surface-1 rounded-xs text-surface-6"
      >
        {items?.map((item, i) => {
          if (item.children) {
            return getSubMenu(item);
          }
          const { onClick, label, shortcut, icon: Icon, separator } = item;
          if (separator) {
            return <ContextMenuSeparator key={label ?? i} />;
          }

          return (
            <ContextMenuItem
              className="hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xs p-0"
              onClick={onClick}
              key={label}
              inset={!Icon}
              disabled={item.disabled}
            >
              <div className="w-full h-full p-0 m-0 bg-transparent hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xs px-2 py-1.5">
                <span className="flex hover:bg-surface-2 gap-2 items-center">
                  {Icon && <Icon className="w-[16px] h-[16px]" />}
                  <div>{label || ""}</div>
                </span>

                {shortcut ? (
                  <ContextMenuShortcut className="flex-grow-0 m-0 min-w-[40px]">
                    {shortcut}
                  </ContextMenuShortcut>
                ) : (
                  <span className="w-[40px]" />
                )}
              </div>
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
};
