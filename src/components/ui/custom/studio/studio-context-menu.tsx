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

interface StudioContextMenuProps {
  children?: React.ReactNode;
  items?: MenuItem[];
  disabled?: boolean;
}

export const StudioContextMenu = ({
  children,
  items,
  disabled,
}: StudioContextMenuProps) => {
  const getSubMenu = ({
    children,
    label,
    onClick,
    shortcut,
    icon: Icon,
    separator,
    disabled,
  }: MenuItem) => {
    if (separator) {
      return <ContextMenuSeparator />;
    }
    if (children && children.length > 0) {
      return (
        <ContextMenuSub key={label}>
          <ContextMenuSubTrigger className="rounded-xxs" inset>
            {label ?? ""}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 rounded-xxs">
            {children.map((child) => getSubMenu(child))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }
    return (
      <ContextMenuItem
        className="hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xxs p-0"
        onClick={onClick}
        disabled={disabled}
        inset={!Icon}
        key={label}
      >
        <div className="w-full h-full p-0 m-0 bg-transparent hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xxs px-2 py-1.5">
          {Icon && <Icon className="w-[16px] h-[16px]" />}
          <div className="w-[104px] ">{label || ""}</div>
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
      <ContextMenuTrigger disabled={disabled}>{children}</ContextMenuTrigger>
      <ContextMenuContent
        onClick={(e) => e.stopPropagation()}
        className="w-56 bg-surface-1 rounded-xxs text-surface-6"
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
              className="hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xxs p-0"
              onClick={onClick}
              inset={!Icon}
              key={label}
              disabled={item.disabled}
            >
              <div className="w-full h-full p-0 m-0 bg-transparent hover:bg-surface-2 flex items-center gap-2 justify-between rounded-xxs px-2 py-1.5">
                <span className="flex gap-2 items-center">
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
